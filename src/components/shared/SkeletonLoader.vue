<script setup lang="ts">
/**
 * 通用骨架屏加载组件
 *
 * 用法:
 * <SkeletonLoader :lines="3" />
 * <SkeletonLoader type="card" />
 * <SkeletonLoader type="circle" size="48" />
 */
interface Props {
  /** 骨架类型 */
  type?: "text" | "card" | "circle" | "rect";
  /** 文本行数（type=text 时有效） */
  lines?: number;
  /** 尺寸（type=circle/rect 时有效） */
  size?: number | string;
  /** 宽度 */
  width?: string;
  /** 高度 */
  height?: string;
}

const _props = withDefaults(defineProps<Props>(), {
  type: "text",
  lines: 1,
  size: 40,
});
</script>

<template>
  <div class="skeleton-loader" :class="`skeleton-${type}`">
    <template v-if="type === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        class="skeleton-line"
        :style="{ width: i === lines && lines > 1 ? '60%' : width || '100%' }"
      />
    </template>

    <template v-else-if="type === 'card'">
      <div class="skeleton-card">
        <div class="skeleton-card-header">
          <div class="skeleton-circle" style="width: 40px; height: 40px" />
          <div class="skeleton-card-meta">
            <div class="skeleton-line" style="width: 120px" />
            <div class="skeleton-line" style="width: 80px; height: 12px" />
          </div>
        </div>
        <div class="skeleton-line" style="width: 100%" />
        <div class="skeleton-line" style="width: 80%" />
      </div>
    </template>

    <template v-else-if="type === 'circle'">
      <div
        class="skeleton-circle"
        :style="{ width: `${size}px`, height: `${size}px` }"
      />
    </template>

    <template v-else-if="type === 'rect'">
      <div
        class="skeleton-rect"
        :style="{ width: width || '100%', height: height || '100px' }"
      />
    </template>
  </div>
</template>

<style scoped>
.skeleton-loader {
  --skeleton-bg: var(--surface);
  --skeleton-shine: var(--border);
}

.skeleton-line,
.skeleton-circle,
.skeleton-rect,
.skeleton-card {
  background: linear-gradient(
    90deg,
    var(--skeleton-bg) 25%,
    var(--skeleton-shine) 50%,
    var(--skeleton-bg) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shine 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-circle,
  .skeleton-rect,
  .skeleton-card {
    animation: none;
    background: var(--skeleton-bg);
  }
}

.skeleton-line {
  height: 16px;
  margin-bottom: 10px;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

.skeleton-circle {
  border-radius: 50%;
}

.skeleton-rect {
  border-radius: var(--radius-md);
}

.skeleton-card {
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.skeleton-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skeleton-card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

@keyframes skeleton-shine {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
