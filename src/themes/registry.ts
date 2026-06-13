/**
 * 主题注册表 — 唯一的主题配置中心
 * 
 * 扩展新主题只需：
 * 1. 在 public/css/ 下新增一个 CSS 文件
 * 2. 在此文件的 COLOR_THEMES 数组中添加一条记录
 */

export interface ColorTheme {
  /** 唯一标识符 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 简短描述 */
  description: string;
  /** 预览主色（用于 UI 色块展示） */
  previewColor: string;
  /** 深色模式下的预览主色 */
  previewColorDark: string;
  /** CSS 文件路径（相对于 public 目录） */
  cssPath: string;
}

export type ThemeMode = 'light' | 'dark';

export const COLOR_THEMES: ColorTheme[] = [
  {
    "id": "default",
    "name": "蓝调",
    "description": "经典蓝紫配色",
    "previewColor": "oklch(0.55 0.22 264)",
    "previewColorDark": "oklch(0.62 0.20 264)",
    "cssPath": "/css/default.css"
  },
  {
    "id": "claude",
    "name": "琥珀",
    "description": "温暖的棕橙色调",
    "previewColor": "oklch(0.58 0.16 40)",
    "previewColorDark": "oklch(0.65 0.15 40)",
    "cssPath": "/css/claude.css"
  },
  {
    "id": "twitter",
    "name": "天际",
    "description": "清爽的天蓝配色",
    "previewColor": "oklch(0.60 0.17 245)",
    "previewColorDark": "oklch(0.62 0.17 245)",
    "cssPath": "/css/twitter.css"
  },
  {
    "id": "vercel",
    "name": "石墨",
    "description": "极简黑白风格",
    "previewColor": "oklch(0.15 0 0)",
    "previewColorDark": "oklch(0.95 0 0)",
    "cssPath": "/css/vercel.css"
  },
  {
    "id": "supabase",
    "name": "翡翠",
    "description": "清新翠绿配色",
    "previewColor": "oklch(0.8348 0.1302 160.9080)",
    "previewColorDark": "oklch(0.4365 0.1044 156.7556)",
    "cssPath": "/css/supabase.css"
  },
  {
    "id": "amber_minimal",
    "name": "Amber Minimal",
    "description": "Amber Minimal 配色风格",
    "previewColor": "oklch(0.7686 0.1647 70.0804)",
    "previewColorDark": "oklch(0.7686 0.1647 70.0804)",
    "cssPath": "/css/amber_minimal.css"
  },
  {
    "id": "amethyst_haze",
    "name": "Amethyst Haze",
    "description": "Amethyst Haze 配色风格",
    "previewColor": "oklch(0.6104 0.0767 299.7335)",
    "previewColorDark": "oklch(0.7058 0.0777 302.0489)",
    "cssPath": "/css/amethyst_haze.css"
  },
  {
    "id": "bold_tech",
    "name": "Bold Tech",
    "description": "Bold Tech 配色风格",
    "previewColor": "oklch(0.6056 0.2189 292.7172)",
    "previewColorDark": "oklch(0.6056 0.2189 292.7172)",
    "cssPath": "/css/bold_tech.css"
  },
  {
    "id": "bubblegum",
    "name": "Bubblegum",
    "description": "Bubblegum 配色风格",
    "previewColor": "oklch(0.6209 0.1801 348.1385)",
    "previewColorDark": "oklch(0.9195 0.0801 87.6670)",
    "cssPath": "/css/bubblegum.css"
  },
  {
    "id": "caffeine",
    "name": "Caffeine",
    "description": "Caffeine 配色风格",
    "previewColor": "oklch(0.4341 0.0392 41.9938)",
    "previewColorDark": "oklch(0.9247 0.0524 66.1732)",
    "cssPath": "/css/caffeine.css"
  },
  {
    "id": "candyland",
    "name": "Candyland",
    "description": "Candyland 配色风格",
    "previewColor": "oklch(0.8677 0.0735 7.0855)",
    "previewColorDark": "oklch(0.8027 0.1355 349.2347)",
    "cssPath": "/css/candyland.css"
  },
  {
    "id": "catppuccin",
    "name": "Catppuccin",
    "description": "Catppuccin 配色风格",
    "previewColor": "oklch(0.5547 0.2503 297.0156)",
    "previewColorDark": "oklch(0.7871 0.1187 304.7693)",
    "cssPath": "/css/catppuccin.css"
  },
  {
    "id": "claymorphism",
    "name": "Claymorphism",
    "description": "Claymorphism 配色风格",
    "previewColor": "oklch(0.5854 0.2041 277.1173)",
    "previewColorDark": "oklch(0.6801 0.1583 276.9349)",
    "cssPath": "/css/claymorphism.css"
  },
  {
    "id": "clean_slate",
    "name": "Clean Slate",
    "description": "Clean Slate 配色风格",
    "previewColor": "oklch(0.5854 0.2041 277.1173)",
    "previewColorDark": "oklch(0.6801 0.1583 276.9349)",
    "cssPath": "/css/clean_slate.css"
  },
  {
    "id": "cosmic_night",
    "name": "Cosmic Night",
    "description": "Cosmic Night 配色风格",
    "previewColor": "oklch(0.5417 0.1790 288.0332)",
    "previewColorDark": "oklch(0.7162 0.1597 290.3962)",
    "cssPath": "/css/cosmic_night.css"
  },
  {
    "id": "cyberpunk",
    "name": "Cyberpunk",
    "description": "Cyberpunk 配色风格",
    "previewColor": "oklch(0.6726 0.2904 341.4084)",
    "previewColorDark": "oklch(0.6726 0.2904 341.4084)",
    "cssPath": "/css/cyberpunk.css"
  },
  {
    "id": "darkmatter",
    "name": "Darkmatter",
    "description": "Darkmatter 配色风格",
    "previewColor": "oklch(0.6716 0.1368 48.5130)",
    "previewColorDark": "oklch(0.7214 0.1337 49.9802)",
    "cssPath": "/css/darkmatter.css"
  },
  {
    "id": "doom",
    "name": "Doom",
    "description": "Doom 配色风格",
    "previewColor": "oklch(0.5016 0.1887 27.4816)",
    "previewColorDark": "oklch(0.6083 0.2090 27.0276)",
    "cssPath": "/css/doom.css"
  },
  {
    "id": "elegant_luxury",
    "name": "Elegant Luxury",
    "description": "Elegant Luxury 配色风格",
    "previewColor": "oklch(0.4650 0.1470 24.9381)",
    "previewColorDark": "oklch(0.5054 0.1905 27.5181)",
    "cssPath": "/css/elegant_luxury.css"
  },
  {
    "id": "graphite",
    "name": "Graphite",
    "description": "Graphite 配色风格",
    "previewColor": "oklch(0.4891 0 0)",
    "previewColorDark": "oklch(0.7058 0 0)",
    "cssPath": "/css/graphite.css"
  },
  {
    "id": "kodama_grove",
    "name": "Kodama Grove",
    "description": "Kodama Grove 配色风格",
    "previewColor": "oklch(0.6657 0.1050 118.9078)",
    "previewColorDark": "oklch(0.6762 0.0567 132.4479)",
    "cssPath": "/css/kodama_grove.css"
  },
  {
    "id": "midnight_bloom",
    "name": "Midnight Bloom",
    "description": "Midnight Bloom 配色风格",
    "previewColor": "oklch(0.5676 0.2021 283.0838)",
    "previewColorDark": "oklch(0.5676 0.2021 283.0838)",
    "cssPath": "/css/midnight_bloom.css"
  },
  {
    "id": "mocha_mousse",
    "name": "Mocha Mousse",
    "description": "Mocha Mousse 配色风格",
    "previewColor": "oklch(0.6083 0.0623 44.3588)",
    "previewColorDark": "oklch(0.7272 0.0539 52.3320)",
    "cssPath": "/css/mocha_mousse.css"
  },
  {
    "id": "modern_minimal",
    "name": "Modern Minimal",
    "description": "Modern Minimal 配色风格",
    "previewColor": "oklch(0.6231 0.1880 259.8145)",
    "previewColorDark": "oklch(0.6231 0.1880 259.8145)",
    "cssPath": "/css/modern_minimal.css"
  },
  {
    "id": "mono",
    "name": "Mono",
    "description": "Mono 配色风格",
    "previewColor": "oklch(0.5555 0 0)",
    "previewColorDark": "oklch(0.5555 0 0)",
    "cssPath": "/css/mono.css"
  },
  {
    "id": "nature",
    "name": "Nature",
    "description": "Nature 配色风格",
    "previewColor": "oklch(0.5234 0.1347 144.1672)",
    "previewColorDark": "oklch(0.6731 0.1624 144.2083)",
    "cssPath": "/css/nature.css"
  },
  {
    "id": "neo_brutalism",
    "name": "Neo Brutalism",
    "description": "Neo Brutalism 配色风格",
    "previewColor": "oklch(0.6489 0.2370 26.9728)",
    "previewColorDark": "oklch(0.7044 0.1872 23.1858)",
    "cssPath": "/css/neo_brutalism.css"
  },
  {
    "id": "northern_lights",
    "name": "Northern Lights",
    "description": "Northern Lights 配色风格",
    "previewColor": "oklch(0.6487 0.1538 150.3071)",
    "previewColorDark": "oklch(0.6487 0.1538 150.3071)",
    "cssPath": "/css/northern_lights.css"
  },
  {
    "id": "notebook",
    "name": "Notebook",
    "description": "Notebook 配色风格",
    "previewColor": "oklch(0.4891 0 0)",
    "previewColorDark": "oklch(0.7572 0 0)",
    "cssPath": "/css/notebook.css"
  },
  {
    "id": "ocean_breeze",
    "name": "Ocean Breeze",
    "description": "Ocean Breeze 配色风格",
    "previewColor": "oklch(0.7227 0.1920 149.5793)",
    "previewColorDark": "oklch(0.7729 0.1535 163.2231)",
    "cssPath": "/css/ocean_breeze.css"
  },
  {
    "id": "pastel_dreams",
    "name": "Pastel Dreams",
    "description": "Pastel Dreams 配色风格",
    "previewColor": "oklch(0.7090 0.1592 293.5412)",
    "previewColorDark": "oklch(0.7874 0.1179 295.7538)",
    "cssPath": "/css/pastel_dreams.css"
  },
  {
    "id": "perpetuity",
    "name": "Perpetuity",
    "description": "Perpetuity 配色风格",
    "previewColor": "oklch(0.5624 0.0947 203.2755)",
    "previewColorDark": "oklch(0.8520 0.1269 195.0354)",
    "cssPath": "/css/perpetuity.css"
  },
  {
    "id": "quantum_rose",
    "name": "Quantum Rose",
    "description": "Quantum Rose 配色风格",
    "previewColor": "oklch(0.6002 0.2414 0.1348)",
    "previewColorDark": "oklch(0.7543 0.2319 332.0212)",
    "cssPath": "/css/quantum_rose.css"
  },
  {
    "id": "retro_arcade",
    "name": "Retro Arcade",
    "description": "Retro Arcade 配色风格",
    "previewColor": "oklch(0.5924 0.2025 355.8943)",
    "previewColorDark": "oklch(0.5924 0.2025 355.8943)",
    "cssPath": "/css/retro_arcade.css"
  },
  {
    "id": "sage_garden",
    "name": "Sage Garden",
    "description": "Sage Garden 配色风格",
    "previewColor": "oklch(0.6333 0.0309 154.9039)",
    "previewColorDark": "oklch(0.6333 0.0309 154.9039)",
    "cssPath": "/css/sage_garden.css"
  },
  {
    "id": "soft_pop",
    "name": "Soft Pop",
    "description": "Soft Pop 配色风格",
    "previewColor": "oklch(0.5106 0.2301 276.9656)",
    "previewColorDark": "oklch(0.6801 0.1583 276.9349)",
    "cssPath": "/css/soft_pop.css"
  },
  {
    "id": "solar_dusk",
    "name": "Solar Dusk",
    "description": "Solar Dusk 配色风格",
    "previewColor": "oklch(0.5553 0.1455 48.9975)",
    "previewColorDark": "oklch(0.7049 0.1867 47.6044)",
    "cssPath": "/css/solar_dusk.css"
  },
  {
    "id": "starry_night",
    "name": "Starry Night",
    "description": "Starry Night 配色风格",
    "previewColor": "oklch(0.4815 0.1178 263.3758)",
    "previewColorDark": "oklch(0.4815 0.1178 263.3758)",
    "cssPath": "/css/starry_night.css"
  },
  {
    "id": "sunset_horizon",
    "name": "Sunset Horizon",
    "description": "Sunset Horizon 配色风格",
    "previewColor": "oklch(0.7357 0.1641 34.7091)",
    "previewColorDark": "oklch(0.7357 0.1641 34.7091)",
    "cssPath": "/css/sunset_horizon.css"
  },
  {
    "id": "t3_chat",
    "name": "T3 Chat",
    "description": "T3 Chat 配色风格",
    "previewColor": "oklch(0.5316 0.1409 355.1999)",
    "previewColorDark": "oklch(0.4607 0.1853 4.0994)",
    "cssPath": "/css/t3_chat.css"
  },
  {
    "id": "tangerine",
    "name": "Tangerine",
    "description": "Tangerine 配色风格",
    "previewColor": "oklch(0.6397 0.1720 36.4421)",
    "previewColorDark": "oklch(0.6397 0.1720 36.4421)",
    "cssPath": "/css/tangerine.css"
  },
  {
    "id": "vintage_paper",
    "name": "Vintage Paper",
    "description": "Vintage Paper 配色风格",
    "previewColor": "oklch(0.6180 0.0778 65.5444)",
    "previewColorDark": "oklch(0.7264 0.0581 66.6967)",
    "cssPath": "/css/vintage_paper.css"
  },
  {
    "id": "violet_bloom",
    "name": "Violet Bloom",
    "description": "Violet Bloom 配色风格",
    "previewColor": "oklch(0.5393 0.2713 286.7462)",
    "previewColorDark": "oklch(0.6132 0.2294 291.7437)",
    "cssPath": "/css/violet_bloom.css"
  }
];

export const DEFAULT_THEME_ID = 'default';
export const DEFAULT_MODE: ThemeMode = 'dark';
