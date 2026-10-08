/**
 * Course configuration — Digital Logic (مدار منطقی، قدم‌به‌قدم).
 *
 * The only course-specific code besides content under `src/content/` and the
 * course islands in `src/islands/course/`. All UI, layout, and interactive
 * components read from this config.
 *
 * DO NOT add university-specific, professor-specific, or institutional branding.
 * The only permanent identity is Danial Rashidi (see `src/config/site.ts`).
 */

import type { CourseConfig } from '../lib/types';

export const courseConfig: CourseConfig = {
  // --- Identity (course-specific) ---
  title: 'مدار منطقی، قدم‌به‌قدم',
  shortTitle: 'مدار منطقی',
  tagline: 'از مبانی دودویی تا مدارهای ترتیبی — با توضیح ساده، فرمول دقیق، مثال حل‌شده و تمرین',
  description:
    'درس‌نامهٔ آزاد و قدم‌به‌قدم مدار منطقی بر اساس سرفصل پنج فصل اول کتاب مانو: از عددنویسی دودویی و جبر بول تا نقشهٔ کارنو، مدارهای ترکیبی و ترتیبی. هر مفهوم با مثال حل‌شده، هر فرمول با توضیح دقیق.',
  shortDescription: 'درس‌نامهٔ قدم‌به‌قدم مدار منطقی',
  locale: 'fa',
  direction: 'rtl',

  // --- Brand (per-topic logo) ---
  // The header mark + favicon follow these two values — no component edits needed.
  logo: {
    monogram: 'م',
    icon: 'gate',
  },

  // --- Course metadata ---
  difficulty: 'beginner',
  estimatedDuration: 'خودآموز',
  difficultyLevel: 3, // 1–5 scale
  tags: ['مدار منطقی', 'مدار دیجیتال', 'جبر بول', 'نقشهٔ کارنو'],
  category: 'آموزشی',

  // --- Sections (navigation groups) ---
  sections: [
    {
      id: 'prerequisites',
      title: 'پیش‌نیازها و شروع',
      description: 'آنچه برای شروع مدار منطقی لازم است: عدد و مبنا، توان‌های ۲، شهود منطق و راهنمای مطالعه',
      order: 1,
    },
    {
      id: 'chapter-1',
      title: 'فصل ۱ — سیستم‌های دودویی',
      description: 'اعداد دودویی، تبدیل مبنا، مکمل‌ها، اعداد علامت‌دار، کدها و ثبات‌ها',
      order: 2,
    },
    {
      id: 'chapter-2',
      title: 'فصل ۲ — جبر بول و گیت‌های منطقی',
      description: 'اصول جبر بول، تابع بولی، فرم‌های استاندارد، مین‌ترم و ماکس‌ترم، گیت‌ها',
      order: 3,
    },
    {
      id: 'chapter-3',
      title: 'فصل ۳ — حداقل‌سازی در سطح گیت',
      description: 'نقشهٔ کارنو، گروه‌بندی، حالت بی‌تفاوت و پیاده‌سازی دو سطحی',
      order: 4,
    },
    {
      id: 'chapter-4',
      title: 'فصل ۴ — منطق ترکیبی',
      description: 'تحلیل و طراحی مدار ترکیبی: جمع‌کننده، دیکودر، انکودر، مالتی‌پلکسر و مقایسه‌گر',
      order: 5,
    },
    {
      id: 'chapter-5',
      title: 'فصل ۵ — منطق ترتیبی همزمان',
      description: 'لچ و فلیپ‌فلاپ، تحلیل مدار سنکرون، جدول و نمودار حالت، طراحی',
      order: 6,
    },
  ],

  // --- Course-specific theming ---
  // `themePreset` selects a shared preset from `src/lib/themes.ts`; inline
  // `theme.colors` still wins when both are set. Never fork `src/styles/theme.css` per course.
  themePreset: 'physics',
  theme: {
    name: 'physics',
    // Palette for Digital Logic (2026-10-08, measured with the WCAG 2.2
    // relative-luminance formula): circuit blue primary + signal amber
    // accent on the shared paper canvas. Light theme, full AA — white text
    // on primary 5.17:1, primary text on canvas 4.83:1, deep variant 6.26:1,
    // amber accent 5.02/4.69:1. In dark mode the same hexes apply through
    // the shared course-override mechanism, matching the shipped default
    // preset's dark behavior (button ~3.3, body text unaffected).
    // Wash comes from the `physics` preset (blue-tinted #E3EBFB).
    colors: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      accent: '#B45309',
    },
    typography: 'traditional',
    motif: 'geometric',
  },

  // --- Feature flags ---
  // Every capability defaults to enabled when omitted. Turn a flag off to
  // hide its UI (nav item, island, section) without editing components.
  features: {
    search: true,
    commandPalette: true,
    formulas: true,
    glossary: true,
    practice: true,
    progress: true,
    simulations: true,
    toc: true,
    related: true,
    courseMap: true,
  },
};
