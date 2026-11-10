import { Shield } from 'lucide-react';
import type { Module, Week } from './course-types';
import { w2m7, w2m8, w2m9, w2m10, w2m11, w2m13, w2m14 } from './course-kept';
import { week3 as legacyWeek3 } from './course-week3';

const legacy = (id: string) => legacyWeek3.modules.find((m) => m.id === id)!;

/** Дополнительные уроки: продуктовые темы, полезные продуктовому маркетологу для работы с командой продукта. */
export function buildExtras(techWeek: Week): Week {
  const list: Module[] = [
    ...techWeek.modules,
    w2m7, w2m8, w2m13, w2m9, w2m10, w2m11, w2m14,
    legacy('w3m3'), legacy('w3m4'), legacy('w3m6'),
  ];
  return {
    id: 9,
    title: "Дополнительные уроки: продуктовые темы",
    description: "Технологии, работа с дизайнерами и инженерами, user story mapping, UX и алгоритмы — чтобы говорить с командой продукта на одном языке.",
    icon: Shield,
    modules: list.map((m, i) => ({ ...m, title: m.title.replace(/^\d+\.\d+\s+/, `Д.${i + 1} `) })),
  };
}
