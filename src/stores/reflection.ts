// ============================================================
// PomodoroX - 反思 Store
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Reflection, CreateReflectionInput, UpdateReflectionInput, ReflectionFilter } from '@/types'
import { db } from '@/services/database'

export const useReflectionStore = defineStore('reflection', () => {
  // ---- 状态 ----
  /** 所有反思列表 */
  const reflections = ref<Reflection[]>([])

  /** 当前筛选条件 */
  const filter = ref<ReflectionFilter>({})

  /** 是否正在加载 */
  const loading = ref(false)

  // ---- 计算属性 ----

  /** 筛选后的反思列表 */
  const filteredReflections = computed(() => {
    let result = [...reflections.value]

    if (filter.value.dateFrom) {
      result = result.filter((r) => r.date >= filter.value.dateFrom!)
    }
    if (filter.value.dateTo) {
      result = result.filter((r) => r.date <= filter.value.dateTo!)
    }
    if (filter.value.mood) {
      result = result.filter((r) => r.mood === filter.value.mood)
    }
    if (filter.value.tag) {
      result = result.filter((r) => r.tags.includes(filter.value.tag!))
    }

    // 按日期倒序
    result.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

    return result
  })

  /** 所有唯一标签 */
  const allTags = computed(() => {
    const tags = new Set<string>()
    reflections.value.forEach((r) => r.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  })

  /** 心情分布统计 */
  const moodDistribution = computed(() => {
    const dist = new Map<string, number>()
    reflections.value.forEach((r) => {
      dist.set(r.mood, (dist.get(r.mood) || 0) + 1)
    })
    return dist
  })

  /** 今日反思 */
  const todayReflections = computed(() => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
    return reflections.value.filter((r) => r.date === dateStr)
  })

  // ---- 方法 ----

  /**
   * 加载所有反思
   */
  async function loadReflections(): Promise<void> {
    loading.value = true
    try {
      reflections.value = await db.getAllReflections()
    } catch (err) {
      console.error('[ReflectionStore] 加载反思失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建新反思
   */
  async function createReflection(input: CreateReflectionInput): Promise<Reflection | null> {
    try {
      const reflection = await db.createReflection(input)
      reflections.value.unshift(reflection)
      return reflection
    } catch (err) {
      console.error('[ReflectionStore] 创建反思失败:', err)
      return null
    }
  }

  /**
   * 更新反思
   */
  async function updateReflection(id: string, input: UpdateReflectionInput): Promise<Reflection | null> {
    try {
      const updated = await db.updateReflection(id, input)
      if (updated) {
        const index = reflections.value.findIndex((r) => r.id === id)
        if (index !== -1) {
          reflections.value[index] = updated
        }
      }
      return updated
    } catch (err) {
      console.error('[ReflectionStore] 更新反思失败:', err)
      return null
    }
  }

  /**
   * 删除反思
   */
  async function deleteReflection(id: string): Promise<boolean> {
    try {
      const success = await db.deleteReflection(id)
      if (success) {
        reflections.value = reflections.value.filter((r) => r.id !== id)
      }
      return success
    } catch (err) {
      console.error('[ReflectionStore] 删除反思失败:', err)
      return false
    }
  }

  /**
   * 根据 ID 获取反思
   */
  function getReflectionById(id: string): Reflection | undefined {
    return reflections.value.find((r) => r.id === id)
  }

  /**
   * 设置筛选条件
   */
  function setFilter(newFilter: Partial<ReflectionFilter>): void {
    filter.value = { ...filter.value, ...newFilter }
  }

  /**
   * 清除筛选条件
   */
  function clearFilter(): void {
    filter.value = {}
  }

  /**
   * 获取指定日期范围的反思
   */
  async function getReflectionsByDateRange(start: string, end: string): Promise<Reflection[]> {
    try {
      return await db.getReflectionsByDateRange(start, end)
    } catch (err) {
      console.error('[ReflectionStore] 获取日期范围反思失败:', err)
      return []
    }
  }

  return {
    // 状态
    reflections,
    filter,
    loading,
    // 计算属性
    filteredReflections,
    allTags,
    moodDistribution,
    todayReflections,
    // 方法
    loadReflections,
    createReflection,
    updateReflection,
    deleteReflection,
    getReflectionById,
    setFilter,
    clearFilter,
    getReflectionsByDateRange,
  }
})
