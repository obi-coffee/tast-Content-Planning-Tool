import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useComments(contentItemId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!contentItemId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('content_item_id', contentItemId)
      .order('created_at', { ascending: true })
    if (!error) setComments(data || [])
    setLoading(false)
  }, [contentItemId])

  useEffect(() => {
    fetchComments()
    if (!contentItemId) return
    const channel = supabase
      .channel(`comments_${contentItemId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `content_item_id=eq.${contentItemId}`
      }, () => {
        fetchComments()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [contentItemId, fetchComments])

  const addComment = async (text, authorId, authorName) => {
    const { error } = await supabase.from('comments').insert([{
      content_item_id: contentItemId,
      text,
      author_id: authorId,
      author_name: authorName,
    }])
    if (error) throw error
  }

  const deleteComment = async (id) => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
  }

  return { comments, loading, addComment, deleteComment }
}
