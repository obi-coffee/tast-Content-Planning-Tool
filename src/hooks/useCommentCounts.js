import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCommentCounts() {
  const [counts, setCounts] = useState({})

  const fetchCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('content_item_id')
    if (error) {
      console.error('useCommentCounts error:', error)
      return
    }
    const map = {}
    ;(data || []).forEach(row => {
      const id = row.content_item_id
      map[id] = (map[id] || 0) + 1
    })
    setCounts(map)
  }, [])

  useEffect(() => {
    fetchCounts()
    const channel = supabase
      .channel('comment_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchCounts)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchCounts])

  return counts
}
