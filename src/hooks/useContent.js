import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── camelCase ↔ snake_case mappers ────────────────────────────────────────
function toDb(item) {
  if (!item) return item
  const { draftCopy, driveUrl, driveUrls, campaignId, assigneeId, ...rest } = item
  const out = { ...rest }
  if (draftCopy  !== undefined) out.draft_copy  = draftCopy
  if (driveUrl   !== undefined) out.drive_url   = driveUrl
  if (driveUrls  !== undefined) out.drive_urls  = driveUrls
  if (campaignId !== undefined) out.campaign_id = campaignId
  if (assigneeId !== undefined) out.assignee_id = assigneeId
  return out
}

function fromDb(row) {
  if (!row) return row
  const { draft_copy, drive_url, drive_urls, campaign_id, assignee_id, ...rest } = row
  return {
    ...rest,
    draftCopy:  draft_copy  ?? '',
    driveUrl:   drive_url   ?? '',
    driveUrls:  Array.isArray(drive_urls) ? drive_urls : [],
    campaignId: campaign_id ?? '',
    assigneeId: assignee_id ?? '',
  }
}

function campToDb(c) {
  if (!c) return c
  const { keyMessage, dropDate, bigThink, ...rest } = c
  const out = { ...rest }
  if (keyMessage !== undefined) out.key_message = keyMessage
  if (dropDate   !== undefined) out.drop_date   = dropDate
  if (bigThink   !== undefined) out.big_think   = bigThink
  return out
}

function campFromDb(row) {
  if (!row) return row
  const { key_message, drop_date, big_think, ...rest } = row
  return {
    ...rest,
    keyMessage: key_message ?? '',
    dropDate:   drop_date   ?? '',
    bigThink:   big_think   ?? '',
  }
}

// ── useContent ────────────────────────────────────────────────────────────
export function useContent() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
      console.error('useContent fetch error:', error)
    } else {
      setItems((data || []).map(fromDb))
    }
    setLoading(false)
  }, [])

  // Initial load + realtime for multi-user sync
  useEffect(() => {
    fetchItems()
    const channel = supabase
      .channel('content_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, fetchItems)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchItems])

  const addItem = async (item) => {
    const { id, created_at, ...rest } = item
    const { error } = await supabase.from('content_items').insert([toDb(rest)])
    if (error) { console.error('addItem error:', error); throw error }
    await fetchItems() // always refetch — don't rely solely on realtime
  }

  const updateItem = async (id, updates) => {
    const { id: _id, created_at, ...rest } = updates
    const { error } = await supabase.from('content_items').update(toDb(rest)).eq('id', id)
    if (error) { console.error('updateItem error:', error); throw error }
    await fetchItems()
  }

  const deleteItem = async (id) => {
    const { error } = await supabase.from('content_items').delete().eq('id', id)
    if (error) { console.error('deleteItem error:', error); throw error }
    await fetchItems()
  }

  return { items, loading, error, addItem, updateItem, deleteItem, refetch: fetchItems }
}

// ── useCampaigns ──────────────────────────────────────────────────────────
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = useCallback(async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCampaigns((data || []).map(campFromDb))
    else console.error('useCampaigns fetch error:', error)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCampaigns()
    const channel = supabase
      .channel('campaigns_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, fetchCampaigns)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchCampaigns])

  const addCampaign = async (campaign) => {
    const { id, created_at, ...rest } = campaign
    const { error } = await supabase.from('campaigns').insert([campToDb(rest)])
    if (error) { console.error('addCampaign error:', error); throw error }
    await fetchCampaigns()
  }

  const updateCampaign = async (id, updates) => {
    const { id: _id, created_at, ...rest } = updates
    const { error } = await supabase.from('campaigns').update(campToDb(rest)).eq('id', id)
    if (error) { console.error('updateCampaign error:', error); throw error }
    await fetchCampaigns()
  }

  const deleteCampaign = async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) { console.error('deleteCampaign error:', error); throw error }
    await fetchCampaigns()
  }

  return { campaigns, loading, addCampaign, updateCampaign, deleteCampaign, refetch: fetchCampaigns }
}

// ── useProducts ───────────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchProducts])

  const addProduct = async (product) => {
    const { error } = await supabase.from('products').insert([product])
    if (error) throw error
    await fetchProducts()
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    await fetchProducts()
  }

  return { products, loading, addProduct, deleteProduct, refetch: fetchProducts }
}

// ── useBrandVoice ─────────────────────────────────────────────────────────
export function useBrandVoice(defaultVoice) {
  const [voice, setVoiceState] = useState(defaultVoice)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'brand_voice')
      .single()
      .then(({ data }) => {
        if (data?.value) setVoiceState(data.value)
        setLoaded(true)
      })
  }, [])

  const setVoice = async (newVoice) => {
    setVoiceState(newVoice)
    await supabase
      .from('settings')
      .upsert({ key: 'brand_voice', value: newVoice }, { onConflict: 'key' })
  }

  return { voice, setVoice, loaded }
}
