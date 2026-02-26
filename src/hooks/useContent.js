import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useContent() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
    const channel = supabase
      .channel('content_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => {
        fetchItems()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchItems])

  const addItem = async (item) => {
    const { error } = await supabase.from('content_items').insert([item])
    if (error) throw error
  }

  const updateItem = async (id, updates) => {
    const { error } = await supabase.from('content_items').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteItem = async (id) => {
    const { error } = await supabase.from('content_items').delete().eq('id', id)
    if (error) throw error
  }

  return { items, loading, error, addItem, updateItem, deleteItem, refetch: fetchItems }
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = useCallback(async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCampaigns(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCampaigns()
    const channel = supabase
      .channel('campaigns_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
        fetchCampaigns()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchCampaigns])

  const addCampaign = async (campaign) => {
    const { error } = await supabase.from('campaigns').insert([campaign])
    if (error) throw error
  }

  const updateCampaign = async (id, updates) => {
    const { error } = await supabase.from('campaigns').update(updates).eq('id', id)
    if (error) throw error
  }

  const deleteCampaign = async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) throw error
  }

  return { campaigns, loading, addCampaign, updateCampaign, deleteCampaign, refetch: fetchCampaigns }
}
