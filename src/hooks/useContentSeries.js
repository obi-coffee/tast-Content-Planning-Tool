import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const SETTINGS_KEY = 'content_series'

// Default series to start with
const DEFAULT_SERIES = [
  { id: 'marginalia', name: 'Marginalia', description: 'An email-first series about the life we create around our products', primaryChannel: 'Email', color: '#F05881' },
  { id: 'the-build', name: 'The Build', description: 'A special series about the building of the app', primaryChannel: 'Instagram', color: '#A23053' },
  { id: 'first-taste', name: 'First Taste', description: 'A video-first series about what makes taste', primaryChannel: 'Instagram Reels', color: '#EF4056' },
]

export function useContentSeries() {
  const [series, setSeries] = useState(DEFAULT_SERIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
            if (Array.isArray(parsed) && parsed.length > 0) setSeries(parsed)
          } catch(e) { /* use defaults */ }
        }
        setLoading(false)
      })
  }, [])

  const saveSeries = useCallback(async (updated) => {
    setSeries(updated)
    await supabase
      .from('settings')
      .upsert({ key: SETTINGS_KEY, value: JSON.stringify(updated) }, { onConflict: 'key' })
  }, [])

  const addSeries = useCallback(async (s) => {
    const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
    const newSeries = [...series, { ...s, id: id + '-' + Date.now() }]
    await saveSeries(newSeries)
  }, [series, saveSeries])

  const updateSeries = useCallback(async (id, updates) => {
    const updated = series.map(s => s.id === id ? { ...s, ...updates } : s)
    await saveSeries(updated)
  }, [series, saveSeries])

  const deleteSeries = useCallback(async (id) => {
    const updated = series.filter(s => s.id !== id)
    await saveSeries(updated)
  }, [series, saveSeries])

  return { series, loading, addSeries, updateSeries, deleteSeries }
}
