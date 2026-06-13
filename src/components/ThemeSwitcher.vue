<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Sun, Moon, Palette, Check } from '@lucide/vue';
import { useTheme } from '../composables/useTheme';

const { mode, colorThemeId, allThemes, toggleMode, setColorTheme } = useTheme();

const showPalette = ref(false);
const paletteRef = ref<HTMLElement | null>(null);

function handleTogglePalette() {
  showPalette.value = !showPalette.value;
}

function handleSelectTheme(id: string) {
  setColorTheme(id);
  showPalette.value = false;
}

// 点击外部关闭调色板
function handleOutsideClick(e: MouseEvent) {
  if (showPalette.value && paletteRef.value && !paletteRef.value.contains(e.target as Node)) {
    showPalette.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<template>
  <!-- 深色/浅色切换按钮 -->
  <button
    @click="toggleMode"
    class="p-1.5 rounded-none border border-border/40 hover:bg-accent hover:border-border transition-all cursor-pointer flex items-center justify-center"
    :title="mode === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
  >
    <Sun
      v-if="mode === 'dark'"
      class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
    />
    <Moon
      v-else
      class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
    />
  </button>

  <!-- 颜色主题选择按钮 -->
  <div class="relative" ref="paletteRef">
    <button
      @click="handleTogglePalette"
      class="p-1.5 rounded-none border border-border/40 hover:bg-accent hover:border-border transition-all cursor-pointer flex items-center justify-center"
      title="切换颜色主题"
    >
      <Palette class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
    </button>

    <!-- 颜色主题下拉面板 -->
    <div
      v-if="showPalette"
      class="absolute right-0 mt-1.5 w-48 max-h-[320px] overflow-y-auto rounded-none shadow-xl border border-border py-1 z-50 bg-popover/95 backdrop-blur-md"
    >
      <button
        v-for="theme in allThemes"
        :key="theme.id"
        @click="handleSelectTheme(theme.id)"
        class="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-all flex items-center gap-2.5 cursor-pointer"
        :class="[theme.id === colorThemeId ? 'text-foreground font-bold' : 'text-muted-foreground']"
      >
        <!-- 主题预览色块 -->
        <span
          class="w-4 h-4 rounded-full shrink-0 border border-border/60"
          :style="{ background: mode === 'dark' ? theme.previewColorDark : theme.previewColor }"
        ></span>
        <!-- 主题名称 -->
        <span class="flex-1">{{ theme.name }}</span>
        <!-- 激活指示器 -->
        <Check
          v-if="theme.id === colorThemeId"
          class="w-3.5 h-3.5 text-primary shrink-0"
        />
      </button>
    </div>
  </div>
</template>
