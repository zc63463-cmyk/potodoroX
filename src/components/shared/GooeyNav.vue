<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";

interface GooeyNavItem {
  label: string;
  value: string;
  color?: string;
}

const props = defineProps<{
  items: GooeyNavItem[];
  activeIndex?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const containerRef = ref<HTMLElement | null>(null);
const navRef = ref<HTMLElement | null>(null);
const filterRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);

const activeIndex = computed(() => props.activeIndex ?? 0);

const noise = (n = 1) => n / 2 - Math.random() * n;

const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

const createParticle = (
  i: number,
  t: number,
  d: [number, number],
  r: number,
  particleCount: number,
  colors: number[]
) => {
  const rotate = noise(r / 10);
  return {
    start: getXY(d[0], particleCount - i, particleCount),
    end: getXY(d[1] + noise(7), particleCount - i, particleCount),
    time: t,
    scale: 1 + noise(0.2),
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
  };
};

const activeItemColor = computed(() => {
  const item = props.items[activeIndex.value];
  return item?.color || "#58A6FF";
});

const particleTimers: ReturnType<typeof setTimeout>[] = [];

const makeParticles = (element: HTMLElement) => {
  const d: [number, number] = [40, 5];
  const r = 60;
  const animationTime = 500;
  const timeVariance = 200;
  const particleCount = 12;
  const bubbleTime = animationTime * 2 + timeVariance;
  element.style.setProperty("--time", `${bubbleTime}ms`);

  const baseColor = activeItemColor.value;

  for (let i = 0; i < particleCount; i++) {
    const t = animationTime * 2 + noise(timeVariance * 2);
    const p = createParticle(i, t, d, r, particleCount, [1]);
    element.classList.remove("active");

    const timer1 = setTimeout(() => {
      if (!document.contains(element)) return;
      const particle = document.createElement("span");
      const point = document.createElement("span");
      particle.classList.add("particle");
      particle.style.setProperty("--start-x", `${p.start[0]}px`);
      particle.style.setProperty("--start-y", `${p.start[1]}px`);
      particle.style.setProperty("--end-x", `${p.end[0]}px`);
      particle.style.setProperty("--end-y", `${p.end[1]}px`);
      particle.style.setProperty("--time", `${p.time}ms`);
      particle.style.setProperty("--scale", `${p.scale}`);
      particle.style.setProperty("--color", baseColor);
      particle.style.setProperty("--rotate", `${p.rotate}deg`);

      point.classList.add("point");
      particle.appendChild(point);
      element.appendChild(particle);
      requestAnimationFrame(() => {
        if (document.contains(element)) element.classList.add("active");
      });
      const timer2 = setTimeout(() => {
        try {
          if (document.contains(element)) element.removeChild(particle);
        } catch {
          // Do nothing
        }
      }, t);
      particleTimers.push(timer2);
    }, 20);
    particleTimers.push(timer1);
  }
};

const updateEffectPosition = (element: HTMLElement) => {
  if (!containerRef.value || !filterRef.value || !textRef.value) return;
  const containerRect = containerRef.value.getBoundingClientRect();
  const pos = element.getBoundingClientRect();

  const styles = {
    left: `${pos.x - containerRect.x}px`,
    top: `${pos.y - containerRect.y}px`,
    width: `${pos.width}px`,
    height: `${pos.height}px`,
  };
  Object.assign(filterRef.value.style, styles);
  Object.assign(textRef.value.style, styles);
  textRef.value.innerText = element.innerText;
};

const handleClick = (e: MouseEvent, index: number) => {
  if (props.disabled) return;
  const liEl = e.currentTarget as HTMLElement;
  if (activeIndex.value === index) return;

  emit("select", index);
  nextTick(() => {
    updateEffectPosition(liEl);

    if (filterRef.value) {
      const particles = filterRef.value.querySelectorAll(".particle");
      particles.forEach((p) => filterRef.value!.removeChild(p));
    }

    if (textRef.value) {
      textRef.value.classList.remove("active");
      void textRef.value.offsetWidth;
      textRef.value.classList.add("active");
    }

    if (filterRef.value) {
      makeParticles(filterRef.value);
    }
  });
};

const handleKeyDown = (e: KeyboardEvent, index: number) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    const liEl = (e.currentTarget as HTMLElement).parentElement;
    if (liEl) {
      handleClick({ currentTarget: liEl } as unknown as MouseEvent, index);
    }
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    if (!navRef.value || !containerRef.value) return;
    const lis = navRef.value.querySelectorAll("li");
    const activeLi = lis[activeIndex.value];
    if (activeLi) {
      updateEffectPosition(activeLi as HTMLElement);
      textRef.value?.classList.add("active");
    }

    resizeObserver = new ResizeObserver(() => {
      if (!navRef.value) return;
      const currentActiveLi =
        navRef.value.querySelectorAll("li")[activeIndex.value];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi as HTMLElement);
      }
    });

    resizeObserver.observe(containerRef.value);
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  particleTimers.forEach(clearTimeout);
  particleTimers.length = 0;
});

watch(activeIndex, () => {
  nextTick(() => {
    if (!navRef.value) return;
    const currentActiveLi =
      navRef.value.querySelectorAll("li")[activeIndex.value];
    if (currentActiveLi) {
      updateEffectPosition(currentActiveLi as HTMLElement);
    }
  });
});
</script>

<template>
  <div
    ref="containerRef"
    class="gooey-nav-container"
    :class="{ disabled: disabled }"
    :style="{ '--active-color': activeItemColor }"
  >
    <nav>
      <ul ref="navRef">
        <li
          v-for="(item, index) in items"
          :key="item.value"
          :class="{ active: activeIndex === index }"
          :aria-disabled="disabled"
        >
          <a
            href="javascript:void(0)"
            tabindex="disabled ? -1 : 0"
            @click.prevent="(e) => handleClick(e, index)"
            @keydown="(e) => handleKeyDown(e, index)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </nav>
    <span ref="filterRef" class="effect filter" aria-hidden="true">
      <span class="filter-bg" />
    </span>
    <span ref="textRef" class="effect text" aria-hidden="true" />
  </div>
</template>

<style scoped>
.gooey-nav-container {
  position: relative;
  display: inline-flex;
  --gooey-color-1: #58a6ff;
  --gooey-color-2: #3fb950;
  --gooey-color-3: #a371f7;
  --gooey-color-4: #f0883e;
}

.gooey-nav-container.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.gooey-nav-container.disabled nav ul li {
  cursor: not-allowed;
}

.gooey-nav-container nav {
  display: flex;
  position: relative;
  transform: translate3d(0, 0, 0.01px);
}

.gooey-nav-container nav ul {
  display: flex;
  gap: 0.25em;
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 3;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 500;
}

.gooey-nav-container nav ul li {
  border-radius: 100vw;
  position: relative;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 0 0.5px 1.5px transparent;
  user-select: none;
}

.gooey-nav-container nav ul li a {
  display: inline-block;
  padding: 0.25em 0.6em;
  text-decoration: none;
  color: inherit;
  outline: none;
  border-radius: 100vw;
}

.gooey-nav-container nav ul li:focus-within:has(:focus-visible) {
  box-shadow: 0 0 0.5px 1.5px var(--accent);
}

.gooey-nav-container nav ul li::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 100vw;
  background: var(--glass-bg);
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
  z-index: -1;
}

.gooey-nav-container nav ul li.active {
  color: white;
  text-shadow: none;
}

.gooey-nav-container nav ul li.active::after {
  opacity: 1;
  transform: scale(1);
}

.gooey-nav-container .effect {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  opacity: 1;
  pointer-events: none;
  display: grid;
  place-items: center;
  z-index: 1;
}

.gooey-nav-container .effect.text {
  color: var(--text-secondary);
  transition: color 0.3s ease;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
}

.gooey-nav-container .effect.text.active {
  color: white;
}

.gooey-nav-container .effect.filter {
  filter: blur(4px);
  border-radius: 100vw;
}

.gooey-nav-container .effect.filter .filter-bg {
  position: absolute;
  inset: -10px;
  z-index: -2;
  background: transparent;
  border-radius: 100vw;
}

.gooey-nav-container .effect.filter::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--active-color);
  transform: scale(0);
  opacity: 0.45;
  z-index: -1;
  border-radius: 100vw;
}

.gooey-nav-container .effect.active::after {
  animation: pill 0.3s ease both;
}

@keyframes pill {
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.particle,
.point {
  display: block;
  opacity: 0;
  width: 5px;
  height: 5px;
  border-radius: 100%;
  transform-origin: center;
}

.particle {
  --time: 5s;
  position: absolute;
  top: calc(50% - 2.5px);
  left: calc(50% - 2.5px);
  animation: particle calc(var(--time)) ease 1 -350ms;
}

.point {
  background: var(--color);
  opacity: 1;
  animation: point calc(var(--time)) ease 1 -350ms;
}

@keyframes particle {
  0% {
    transform: rotate(0deg)
      translate(calc(var(--start-x)), calc(var(--start-y)));
    opacity: 1;
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }

  70% {
    transform: rotate(calc(var(--rotate) * 0.5))
      translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
    opacity: 1;
    animation-timing-function: ease;
  }

  85% {
    transform: rotate(calc(var(--rotate) * 0.66))
      translate(calc(var(--end-x)), calc(var(--end-y)));
    opacity: 1;
  }

  100% {
    transform: rotate(calc(var(--rotate) * 1.2))
      translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
    opacity: 1;
  }
}

@keyframes point {
  0% {
    transform: scale(0);
    opacity: 0;
    animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
  }

  25% {
    transform: scale(calc(var(--scale) * 0.25));
  }

  38% {
    opacity: 1;
  }

  65% {
    transform: scale(var(--scale));
    opacity: 1;
    animation-timing-function: ease;
  }

  85% {
    transform: scale(var(--scale));
    opacity: 1;
  }

  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style>
