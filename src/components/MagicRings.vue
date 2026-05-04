<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst, uPaused;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform int uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float raw = uTime + t0;
  float t = uPaused > 0.5 ? floor(raw / CYCLE) * CYCLE + t0 : mod(raw, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(float(uRingCount) - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (i >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
}
`

const props = withDefaults(defineProps<{
  color?: string
  colorTwo?: string
  ringCount?: number
  speed?: number
  attenuation?: number
  lineThickness?: number
  baseRadius?: number
  radiusStep?: number
  scaleRate?: number
  opacity?: number
  blur?: number
  noiseAmount?: number
  rotation?: number
  ringGap?: number
  fadeIn?: number
  fadeOut?: number
  followMouse?: boolean
  mouseInfluence?: number
  hoverScale?: number
  parallax?: number
  clickBurst?: boolean
  isActive?: boolean
}>(), {
  color: '#A855F7',
  colorTwo: '#6366F1',
  ringCount: 6,
  speed: 1,
  attenuation: 10,
  lineThickness: 2,
  baseRadius: 0.35,
  radiusStep: 0.1,
  scaleRate: 0.1,
  opacity: 1,
  blur: 0,
  noiseAmount: 0.1,
  rotation: 0,
  ringGap: 1.5,
  fadeIn: 0.7,
  fadeOut: 0.5,
  followMouse: false,
  mouseInfluence: 0.2,
  hoverScale: 1.2,
  parallax: 0.05,
  clickBurst: false,
  isActive: true,
})

/** 是否应跳过渲染（仅限超低端设备或移动端） */
const shouldSkipRender = computed(() => {
  if (typeof window === 'undefined') return true
  const dpr = window.devicePixelRatio || 1
  const cores = navigator.hardwareConcurrency || 2
  // 仅跳过极低配置：非 Retina DPR (< 1) 或单核 CPU
  // 普通显示器 DPR=1 和双核 CPU 都正常渲染
  return dpr < 1 || cores < 2
})

const containerRef = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let material: THREE.ShaderMaterial | null = null
let quad: THREE.Mesh | null = null
let frameId = 0
let mouseX = 0
let mouseY = 0
let smoothX = 0
let smoothY = 0
let hoverAmount = 0
let isHovered = false
let burst = 0

onMounted(() => {
  // 低端设备跳过 Three.js 渲染
  if (shouldSkipRender.value) return

  const mount = containerRef.value
  if (!mount) return

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true })
  } catch {
    return
  }

  renderer.setClearColor(0x000000, 0)
  mount.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
  camera.position.z = 1

  const uniforms = {
    uTime: { value: 0 },
    uAttenuation: { value: props.attenuation },
    uResolution: { value: new THREE.Vector2() },
    uColor: { value: new THREE.Color(props.color) },
    uColorTwo: { value: new THREE.Color(props.colorTwo) },
    uLineThickness: { value: props.lineThickness },
    uBaseRadius: { value: props.baseRadius },
    uRadiusStep: { value: props.radiusStep },
    uScaleRate: { value: props.scaleRate },
    uRingCount: { value: props.ringCount },
    uOpacity: { value: props.opacity },
    uNoiseAmount: { value: props.noiseAmount },
    uRotation: { value: (props.rotation * Math.PI) / 180 },
    uRingGap: { value: props.ringGap },
    uFadeIn: { value: props.fadeIn },
    uFadeOut: { value: props.fadeOut },
    uMouse: { value: new THREE.Vector2() },
    uMouseInfluence: { value: props.followMouse ? props.mouseInfluence : 0 },
    uHoverAmount: { value: 0 },
    uHoverScale: { value: props.hoverScale },
    uParallax: { value: props.parallax },
    uBurst: { value: 0 },
    uPaused: { value: 0 },
  }

  material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true })
  quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  scene.add(quad)

  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    const dpr = Math.min(window.devicePixelRatio, 2)
    renderer?.setSize(w, h)
    renderer?.setPixelRatio(dpr)
    uniforms.uResolution.value.set(w * dpr, h * dpr)
  }
  resize()
  window.addEventListener('resize', resize)

  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  const onMouseMove = (e: MouseEvent) => {
    const rect = mount.getBoundingClientRect()
    mouseX = (e.clientX - rect.left) / rect.width - 0.5
    mouseY = -((e.clientY - rect.top) / rect.height - 0.5)
  }
  const onMouseEnter = () => { isHovered = true }
  const onMouseLeave = () => {
    isHovered = false
    mouseX = 0
    mouseY = 0
  }
  const onClick = () => { burst = 1 }

  mount.addEventListener('mousemove', onMouseMove)
  mount.addEventListener('mouseenter', onMouseEnter)
  mount.addEventListener('mouseleave', onMouseLeave)
  if (props.clickBurst) mount.addEventListener('click', onClick)

  const animate = (t: number) => {
    frameId = requestAnimationFrame(animate)

    smoothX += (mouseX - smoothX) * 0.08
    smoothY += (mouseY - smoothY) * 0.08
    hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * 0.08
    burst *= 0.95
    if (burst < 0.001) burst = 0

    uniforms.uTime.value = t * 0.001 * props.speed
    uniforms.uAttenuation.value = props.attenuation
    uniforms.uColor.value.set(props.color)
    uniforms.uColorTwo.value.set(props.colorTwo)
    uniforms.uLineThickness.value = props.lineThickness
    uniforms.uBaseRadius.value = props.baseRadius
    uniforms.uRadiusStep.value = props.radiusStep
    uniforms.uScaleRate.value = props.scaleRate
    uniforms.uRingCount.value = props.ringCount
    uniforms.uOpacity.value = props.opacity
    uniforms.uNoiseAmount.value = props.noiseAmount
    uniforms.uRotation.value = (props.rotation * Math.PI) / 180
    uniforms.uRingGap.value = props.ringGap
    uniforms.uFadeIn.value = props.fadeIn
    uniforms.uFadeOut.value = props.fadeOut
    uniforms.uMouse.value.set(smoothX, smoothY)
    uniforms.uMouseInfluence.value = props.followMouse ? props.mouseInfluence : 0
    uniforms.uHoverAmount.value = hoverAmount
    uniforms.uHoverScale.value = props.hoverScale
    uniforms.uParallax.value = props.parallax
    uniforms.uBurst.value = props.clickBurst ? burst : 0

    uniforms.uPaused.value = props.isActive ? 0 : 1

    renderer?.render(scene!, camera!)
  }
  frameId = requestAnimationFrame(animate)

  onUnmounted(() => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', resize)
    ro.disconnect()
    mount.removeEventListener('mousemove', onMouseMove)
    mount.removeEventListener('mouseenter', onMouseEnter)
    mount.removeEventListener('mouseleave', onMouseLeave)
    mount.removeEventListener('click', onClick)
    if (renderer?.domElement.parentNode === mount) {
      mount.removeChild(renderer.domElement)
    }
    renderer?.dispose()
    material?.dispose()
  })
})
</script>

<template>
  <div
    ref="containerRef"
    class="magic-rings-container"
    :style="{ filter: blur > 0 ? `blur(${blur}px)` : undefined }"
  />
</template>

<style scoped>
.magic-rings-container {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.magic-rings-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
