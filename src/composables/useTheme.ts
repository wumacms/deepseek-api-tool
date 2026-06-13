import { ref, computed, watch } from 'vue';
import {
  COLOR_THEMES,
  DEFAULT_THEME_ID,
  DEFAULT_MODE,
  type ColorTheme,
  type ThemeMode,
} from '../themes/registry';

const STORAGE_KEY_THEME = 'deepseek_color_theme';
const STORAGE_KEY_MODE = 'deepseek_theme_mode';
const LINK_ELEMENT_ID = 'color-theme-stylesheet';

// ==================== 共享单例状态 ====================
const colorThemeId = ref<string>(
  localStorage.getItem(STORAGE_KEY_THEME) || DEFAULT_THEME_ID
);
const mode = ref<ThemeMode>(
  (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) || DEFAULT_MODE
);

/**
 * 在 DOM 最早期初始化主题（防止 FOUC）。
 * 此函数应在 createApp 之前调用。
 */
export function initTheme(): void {
  const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) || DEFAULT_MODE;
  applyModeToDOM(savedMode);
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || DEFAULT_THEME_ID;
  loadThemeCSS(savedTheme);
}

/** 将 dark class 应用到 <html> */
function applyModeToDOM(m: ThemeMode): void {
  if (m === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/** 动态加载/替换颜色主题 CSS */
function loadThemeCSS(themeId: string): void {
  const theme = COLOR_THEMES.find((t) => t.id === themeId);
  if (!theme) return;

  let linkEl = document.getElementById(LINK_ELEMENT_ID) as HTMLLinkElement | null;
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.id = LINK_ELEMENT_ID;
    linkEl.rel = 'stylesheet';
    document.head.appendChild(linkEl);
  }
  linkEl.href = theme.cssPath;
}

/**
 * 主题状态管理 Composable
 *
 * 提供：
 * - colorThemeId: 当前颜色主题 ID
 * - mode: 当前深色/浅色模式
 * - currentTheme: 当前颜色主题元信息
 * - allThemes: 所有可选颜色主题
 * - toggleMode(): 切换深色/浅色
 * - setMode(m): 设置模式
 * - setColorTheme(id): 设置颜色主题
 */
export function useTheme() {
  const currentTheme = computed<ColorTheme>(
    () => COLOR_THEMES.find((t) => t.id === colorThemeId.value) || COLOR_THEMES[0]
  );

  const allThemes = COLOR_THEMES;

  // ==================== 模式切换 ====================
  function toggleMode(): void {
    mode.value = mode.value === 'dark' ? 'light' : 'dark';
  }

  function setMode(m: ThemeMode): void {
    mode.value = m;
  }

  // ==================== 颜色主题切换 ====================
  function setColorTheme(id: string): void {
    if (COLOR_THEMES.some((t) => t.id === id)) {
      colorThemeId.value = id;
    }
  }

  // ==================== 副作用：监听变化并应用 ====================
  watch(
    mode,
    (newMode) => {
      applyModeToDOM(newMode);
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
    },
    { immediate: true }
  );

  watch(
    colorThemeId,
    (newId) => {
      loadThemeCSS(newId);
      localStorage.setItem(STORAGE_KEY_THEME, newId);
    },
    { immediate: true }
  );

  return {
    colorThemeId,
    mode,
    currentTheme,
    allThemes,
    toggleMode,
    setMode,
    setColorTheme,
  };
}
