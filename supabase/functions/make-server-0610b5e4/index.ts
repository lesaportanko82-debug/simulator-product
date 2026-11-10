import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Helper to safely extract error message
function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}


// --- Auth helpers ---
const ADMIN_EMAILS = (Deno.env.get("ADMIN_EMAILS") || "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const authClient = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

/** Пользователь по Bearer-токену сессии; null — если токена нет или он не пользовательский. */
async function getUser(c: any): Promise<any | null> {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

function isAdmin(user: any): boolean {
  return !!user?.email && ADMIN_EMAILS.includes(String(user.email).toLowerCase());
}

/** userId из пути, если он принадлежит текущему пользователю (или пользователь — админ).
 *  "me"/"demo-user" заменяются на id текущего пользователя. */
async function resolveUserId(c: any): Promise<string | null> {
  const user = await getUser(c);
  if (!user) return null;
  const param = c.req.param("userId");
  if (!param || param === "me" || param === "demo-user") return user.id;
  if (param === user.id || isAdmin(user)) return param;
  return null;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0610b5e4/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Profile API ---

// Get user profile (extended data)
app.get("/make-server-0610b5e4/profile/:userId", async (c) => {
    const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    try {
        const profile = await kv.get(`profile:${userId}`);
        return c.json({ profile: profile || {} });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

// Update user profile (extended data)
app.post("/make-server-0610b5e4/profile/:userId", async (c) => {
    const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.json();
        const { goal, bio } = body;

        const key = `profile:${userId}`;
        const currentProfile: any = (await kv.get(key)) || {};
        
        const newProfile = {
            ...currentProfile,
            goal: goal !== undefined ? goal : currentProfile.goal,
            bio: bio !== undefined ? bio : currentProfile.bio,
            updatedAt: new Date().toISOString()
        };

        await kv.set(key, newProfile);
        return c.json({ success: true, profile: newProfile });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

// Upload avatar (bypassing RLS by using service role)
app.post("/make-server-0610b5e4/upload-avatar/:userId", async (c) => {
  const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.parseBody();
    const file: any = body['file'];

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    // Ensure bucket exists (idempotent)
    const bucketName = 'make-0610b5e4-avatars';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === bucketName);
    
    if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: true });
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: true
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return c.json({ success: true, publicUrl });
  } catch (error) {
      console.error("Server upload error:", error);
      return c.json({ error: errMsg(error) }, 500);
  }
});

// Upload attachment (for tasks/cases)
app.post("/make-server-0610b5e4/upload-attachment/:userId", async (c) => {
  const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.parseBody();
    const file: any = body['file'];

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    // Ensure bucket exists (idempotent)
    const bucketName = 'make-0610b5e4-attachments';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === bucketName);
    
    if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: true });
    }

    // Sanitize filename and create path
    const fileExt = file.name.split('.').pop();
    const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `${userId}/${Date.now()}_${safeName}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
            contentType: file.type,
            upsert: true
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return c.json({ success: true, publicUrl, fileName: file.name });
  } catch (error) {
      console.error("Server attachment upload error:", error);
      return c.json({ error: errMsg(error) }, 500);
  }
});

// --- Case Answers API ---

// Get all answers for a user (using a fixed demo user ID for now if no auth)
app.get("/make-server-0610b5e4/case-answers/:userId", async (c) => {
  const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  try {
    // We store answers as a single object keyed by "answers:userId"
    const answers = await kv.get(`answers:${userId}`);
    return c.json({ answers: answers || {} });
  } catch (error) {
    return c.json({ error: errMsg(error) }, 500);
  }
});

// Save an answer for a specific case
app.post("/make-server-0610b5e4/case-answers/:userId", async (c) => {
  const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const { caseId, answer } = body;

    if (!caseId) {
      return c.json({ error: "caseId is required" }, 400);
    }

    // Get existing answers
    const existingKey = `answers:${userId}`;
    const existingData: any = (await kv.get(existingKey)) || {};
    
    // Update specific case answer
    const newData = {
      ...existingData,
      [caseId]: answer
    };

    await kv.set(existingKey, newData);
    return c.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return c.json({ error: errMsg(error) }, 500);
  }
});

// --- Bookmarks API ---

// Get all bookmarks for a user
app.get("/make-server-0610b5e4/bookmarks/:userId", async (c) => {
  const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  try {
    const bookmarks = await kv.get(`bookmarks:${userId}`);
    return c.json({ bookmarks: bookmarks || [] });
  } catch (error) {
    return c.json({ error: errMsg(error) }, 500);
  }
});

// Toggle bookmark
app.post("/make-server-0610b5e4/bookmarks/:userId", async (c) => {
  const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const { articleId, action } = body; // action: 'add' | 'remove'

    if (!articleId || !action) {
      return c.json({ error: "articleId and action are required" }, 400);
    }

    const key = `bookmarks:${userId}`;
    let bookmarks: any = (await kv.get(key)) || [];
    
    // Ensure bookmarks is an array (in case of legacy data)
    if (!Array.isArray(bookmarks)) bookmarks = [];

    if (action === 'add') {
      if (!bookmarks.includes(articleId)) {
        bookmarks.push(articleId);
      }
    } else if (action === 'remove') {
      bookmarks = bookmarks.filter((id: string) => id !== articleId);
    }

    await kv.set(key, bookmarks);
    return c.json({ success: true, bookmarks });
  } catch (error) {
    console.error("Bookmark error:", error);
    return c.json({ error: errMsg(error) }, 500);
  }
});

// --- Bookings API ---

// Create a booking
app.post("/make-server-0610b5e4/bookings", async (c) => {
    const me = await getUser(c);
    if (!me) return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.json();
        const { date, time } = body;
        const userId = me.id;
        const userEmail = me.email || body.userEmail;

        if (!userId || !userEmail || !date || !time) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const bookingId = `booking:${userId}:${new Date().getTime()}`;
        const bookingData = {
            id: bookingId,
            userId,
            userEmail,
            date,
            time,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };

        // Save to KV
        await kv.set(bookingId, bookingData);

        return c.json({ success: true, booking: bookingData });
    } catch (error) {
        console.error("Booking error:", error);
        return c.json({ error: errMsg(error) }, 500);
    }
});

// Get all bookings (admin)
app.get("/make-server-0610b5e4/bookings", async (c) => {
    if (!isAdmin(await getUser(c))) return c.json({ error: "Forbidden" }, 403);
    try {
        // In a real app, verify admin role here
        // For now, we return all bookings
        const bookings = await kv.getByPrefix("booking:");
        return c.json({ bookings: bookings || [] });
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return c.json({ error: errMsg(error) }, 500);
    }
});

// --- Auth Mock ---

// Admin: Get all users
app.get("/make-server-0610b5e4/admin/users", async (c) => {
    if (!isAdmin(await getUser(c))) return c.json({ error: "Forbidden" }, 403);
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        );

        const { data: { users }, error } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (error) {
            console.error("List users error:", error);
            return c.json({ error: error.message }, 500);
        }

        return c.json({ users });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

// Admin: Get user details (progress, answers)
app.get("/make-server-0610b5e4/admin/user-details/:userId", async (c) => {
    if (!isAdmin(await getUser(c))) return c.json({ error: "Forbidden" }, 403);
    const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    try {
        const progress = await kv.get(`progress:${userId}`);
        const answers = await kv.get(`answers:${userId}`);
        return c.json({ 
            progress: progress || {},
            answers: answers || {}
        });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

// User/Admin: Sync Progress
app.post("/make-server-0610b5e4/progress/:userId", async (c) => {
    const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.json();
        const { progress } = body;
        
        await kv.set(`progress:${userId}`, progress);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

// User: Get Progress
app.get("/make-server-0610b5e4/progress/:userId", async (c) => {
    const userId = await resolveUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    try {
        const progress = await kv.get(`progress:${userId}`);
        return c.json({ progress: progress || null });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

// --- AI Mentor API ---

// AI: Review case answer
app.post("/make-server-0610b5e4/ai/review", async (c) => {
    if (!(await getUser(c))) return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.json();
        const { caseContext, caseProblem, caseData, caseTask, userAnswer } = body;

        if (!userAnswer || !caseTask) {
            return c.json({ error: "userAnswer and caseTask are required" }, 400);
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return c.json({ error: "OpenAI API key not configured" }, 500);
        }

        const systemPrompt = `Ты — опытный Senior Product Manager и ментор в PM-академии. Ты проверяешь ответы студентов на бизнес-кейсы.

Твоя задача — дать КОНСТРУКТИВНУЮ обратную связь на ответ студента. Будь строг, но справедлив.

ФОРМАТ ОТВЕТА (строго JSON):
{
  "score": NUMBER_0_TO_100,
  "grade": "одно из: Отлично|Хорошо|Неплохо|Нужна доработка|Слабо",
  "summary": "2-3 предложения общей оценки",
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "weaknesses": ["слабая сторона 1", "слабая сторона 2"],
  "missed": ["что упущено 1", "что упущено 2"],
  "criteria": {
    "analytics": { "score": NUMBER_0_TO_100, "comment": "краткий комментарий" },
    "structure": { "score": NUMBER_0_TO_100, "comment": "краткий комментарий" },
    "creativity": { "score": NUMBER_0_TO_100, "comment": "краткий комментарий" },
    "feasibility": { "score": NUMBER_0_TO_100, "comment": "краткий комментарий" },
    "depth": { "score": NUMBER_0_TO_100, "comment": "краткий комментарий" }
  },
  "recommendation": "конкретная рекомендация что улучшить, 2-3 предложения"
}

Критерии оценки:
- analytics (Аналитика): использует ли студент данные из кейса, считает ли метрики, декомпозирует ли проблему
- structure (Структура): логичность, последовательность, четкая структура ответа
- creativity (Креативность): нестандартные подходы, оригинальные идеи
- feasibility (Реалистичность): можно ли реализовать предложения, учтены ли ограничения
- depth (Глубина): насколько глубоко проработаны решения, есть ли конкретика

ВАЖНО: отвечай ТОЛЬКО валидным JSON без markdown-обертки.`;

        const userPrompt = "КОНТЕКСТ КЕЙСА:\n" + (caseContext || "") + "\n\nПРОБЛЕМА:\n" + (caseProblem || "") + "\n\nДАННЫЕ:\n" + (caseData || "") + "\n\nЗАДАНИЕ:\n" + (caseTask || "") + "\n\nОТВЕТ СТУДЕНТА:\n" + (userAnswer || "") + "\n\nОцени ответ студента по заданным критериям.";

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.log("OpenAI API error:", errText);
            return c.json({ error: "OpenAI API error: " + response.status }, 500);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return c.json({ error: "Empty response from OpenAI" }, 500);
        }

        // Parse JSON response
        try {
            const review = JSON.parse(content);
            return c.json({ success: true, review });
        } catch (_parseErr) {
            console.log("Failed to parse OpenAI response:", content);
            // Try to extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const review = JSON.parse(jsonMatch[0]);
                return c.json({ success: true, review });
            }
            return c.json({ error: "Failed to parse AI response" }, 500);
        }
    } catch (error) {
        console.log("AI review error:", error);
        return c.json({ error: errMsg(error) }, 500);
    }
});

// AI: Contextual hint (doesn't give the answer, asks guiding questions)
app.post("/make-server-0610b5e4/ai/hint", async (c) => {
    if (!(await getUser(c))) return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.json();
        const { caseContext, caseProblem, caseData, caseTask, userAnswer, hintType } = body;

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return c.json({ error: "OpenAI API key not configured" }, 500);
        }

        const hintPrompts: Record<string, string> = {
            'start': 'Студент не знает с чего начать. Задай 2-3 наводящих вопроса, которые помогут начать анализ. НЕ давай ответ.',
            'stuck': 'Студент застрял в процессе решения. Подскажи направление мышления, задай наводящие вопросы. НЕ давай готовое решение.',
            'check': 'Студент хочет проверить направление мысли. Прокомментируй то что он написал и подскажи что ещё стоит учесть.',
            'framework': 'Студент просит подсказку по фреймворку. Предложи 1-2 подходящих PM-фреймворка для этого кейса и кратко объясни как их применить.'
        };

        const hintInstruction = hintPrompts[hintType] || hintPrompts['stuck'];

        const systemPrompt = "Ты — ментор в PM-академии. Твоя роль — помогать студентам ДУМАТЬ, а не давать готовые ответы.\n\nПРАВИЛА:\n1. НИКОГДА не давай прямой ответ на задание\n2. Задавай наводящие вопросы\n3. Подсказывай направление мышления\n4. Ссылайся на конкретные данные из кейса\n5. Будь дружелюбным и поддерживающим\n6. Отвечай по-русски\n7. Ответ 3-5 предложений максимум, будь лаконичен\n\n" + hintInstruction;

        const studentPart = userAnswer ? ("ТЕКУЩИЙ ОТВЕТ СТУДЕНТА: " + userAnswer) : "Студент ещё ничего не написал.";
        const userPrompt = "КЕЙС: " + (caseContext || "").substring(0, 500) + "\n\nПРОБЛЕМА: " + (caseProblem || "").substring(0, 500) + "\n\nДАННЫЕ: " + (caseData || "").substring(0, 500) + "\n\nЗАДАНИЕ: " + (caseTask || "") + "\n\n" + studentPart;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.log("OpenAI hint error:", errText);
            return c.json({ error: "OpenAI API error: " + response.status }, 500);
        }

        const data = await response.json();
        const hint = data.choices?.[0]?.message?.content;

        if (!hint) {
            return c.json({ error: "Empty response from OpenAI" }, 500);
        }

        return c.json({ success: true, hint });
    } catch (error) {
        console.log("AI hint error:", error);
        return c.json({ error: errMsg(error) }, 500);
    }
});

// --- AI Simulator Hint Endpoint ---
app.post("/make-server-0610b5e4/ai/simulator-hint", async (c) => {
    if (!(await getUser(c))) return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.json();
        const { question, context } = body;

        if (!question) {
            return c.json({ error: "Question is required" }, 400);
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return c.json({ error: "OpenAI API key not configured" }, 500);
        }

        const systemPrompt = `Ты — AI-ментор для симулятора PM-менеджера. Твоя задача — помогать студентам разбираться в сложных ситуациях и принимать решения как настоящий PM.

Контекст симуляции:
${context}

Правила ответов:
1. Будь кратким и конкретным (2-3 предложения)
2. Не давай прямых ответов — задавай наводящие вопросы
3. Объясняй PM-концепции простым языком
4. Используй примеры из реальной практики
5. Говори дружелюбно и мотивируй`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                temperature: 0.8,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.log("OpenAI simulator hint error:", errText);
            return c.json({ error: "OpenAI API error: " + response.status }, 500);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;

        if (!answer) {
            return c.json({ error: "Empty response from OpenAI" }, 500);
        }

        return c.json({ success: true, answer });
    } catch (error) {
        console.log("AI simulator hint error:", error);
        return c.json({ error: errMsg(error) }, 500);
    }
});

// AI chat proxy for AIMentor / SimulatorGP: the OpenAI key stays on the server.
app.post("/make-server-0610b5e4/ai/chat", async (c) => {
    if (!(await getUser(c))) return c.json({ error: "Unauthorized" }, 401);
    try {
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) return c.json({ error: "OpenAI API key not configured" }, 500);
        const body = await c.req.json();
        const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
        if (!messages.length) return c.json({ error: "messages required" }, 400);
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
                max_tokens: Math.min(Number(body.max_tokens) || 800, 1200),
                stream: body.stream === true,
            }),
        });
        return new Response(res.body, {
            status: res.status,
            headers: {
                'Content-Type': res.headers.get('Content-Type') || 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        return c.json({ error: errMsg(error) }, 500);
    }
});

Deno.serve(app.fetch);