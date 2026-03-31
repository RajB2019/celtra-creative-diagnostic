import { useMemo } from 'react'

/**
 * useFilteredData(creatives, filters) → filtered subset
 * filters: { platform?, format?, funnelStage? }
 */
export function useFilteredData(creatives, filters = {}) {
  return useMemo(() => {
    return creatives.filter((c) => {
      if (filters.platform && c.platform !== filters.platform) return false
      if (filters.format && c.format !== filters.format) return false
      if (filters.funnelStage && c.funnel_stage !== filters.funnelStage) return false
      return true
    })
  }, [creatives, filters.platform, filters.format, filters.funnelStage])
}
