import { supabase } from './supabase';
import { fetchWithRetry } from './fetch';
import { projectId } from '/utils/supabase/info';

export type ProgressType = Record<string, 'locked' | 'unlocked' | 'completed'>;

// ─── helpers ─────────────────────────────────────────────────────────────────

function progressUrl(userId: string) {
  return `https://${projectId}.supabase.co/functions/v1/make-server-0610b5e4/progress/${userId}`;
}

/**
 * Silent fire-and-forget server sync — never throws, never blocks the caller.
 *
 * Uses plain fetch (no retry, no abort timeout) because:
 *  - localStorage is always written first, so local state is never at risk.
 *  - Retrying with a hard timeout against a cold edge-function causes
 *    noisy "AbortError: signal is aborted without reason" console spam.
 *  - If this call fails the user can still continue; the next save will sync.
 */
function syncToServer(userId: string, accessToken: string, progress: ProgressType): void {
  if (!projectId) return;

  fetch(progressUrl(userId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ progress }),
  })
    .then(res => {
      if (res.ok) {
        console.log('✅ Progress synced to server');
      } else {
        console.warn('⚠️ Progress sync returned non-ok status:', res.status);
      }
    })
    .catch(() => {
      // Server is unreachable — progress is already saved in localStorage.
      console.warn('⚠️ Could not sync progress to server (offline?). Local copy is up to date.');
    });
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Load user progress.
 * Priority: localStorage (instant) → server (background refresh)
 */
export async function loadUserProgress(defaultProgress: ProgressType): Promise<ProgressType> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Return cached value immediately so the UI is instant
    const cached = localStorage.getItem(`pm-progress-${session.user.id}`);
    const result: ProgressType = cached ? JSON.parse(cached) : defaultProgress;

    // Refresh from server in the background using plain fetch.
    // Failures are silently ignored — localStorage is the source of truth.
    if (projectId) {
      fetch(progressUrl(session.user.id), {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
        .then(res => (res.ok ? res.json() : null))
        .then((data: any) => {
          if (data?.progress) {
            localStorage.setItem(
              `pm-progress-${session.user.id}`,
              JSON.stringify(data.progress)
            );
            console.log('✅ Progress refreshed from server');
          }
        })
        .catch(() => {
          // Background refresh failed — cached copy will be used. No action needed.
        });
    }

    return result;
  }

  // Unauthenticated: try legacy local key
  const legacy = localStorage.getItem('pm-course-progress-v2');
  if (legacy) {
    try { return JSON.parse(legacy); } catch { /* ignore */ }
  }

  return defaultProgress;
}

/**
 * Save user progress.
 * Always writes to localStorage first (instant), then syncs to server in the background.
 */
export async function saveUserProgress(progress: ProgressType): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    // Not logged in — local-only
    localStorage.setItem('pm-course-progress-v2', JSON.stringify(progress));
    return;
  }

  // 1. Write locally (synchronous — always succeeds)
  localStorage.setItem(`pm-progress-${session.user.id}`, JSON.stringify(progress));

  // 2. Sync to server in the background — never blocks the caller
  syncToServer(session.user.id, session.access_token, progress);
}

/**
 * Migrate legacy anonymous progress into the authenticated user's slot.
 */
export async function migrateLocalProgress(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  // Already migrated
  if (localStorage.getItem(`pm-progress-${session.user.id}`)) return;

  const legacy = localStorage.getItem('pm-course-progress-v2');
  if (legacy) {
    try {
      await saveUserProgress(JSON.parse(legacy));
      console.log('Legacy progress migrated successfully');
    } catch (error) {
      console.warn('Failed to migrate legacy progress:', error);
    }
  }
}
