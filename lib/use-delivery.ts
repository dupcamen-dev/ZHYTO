import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export interface DeliverySettings {
  min_order: number
  free_threshold: number
  fee: number
}

const defaults: DeliverySettings = { min_order: 10, free_threshold: 50, fee: 5 }

export function useDeliverySettings() {
  const [settings, setSettings] = useState<DeliverySettings>(defaults)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoaded(true); return }
    supabase.from('settings').select('value').eq('key', 'delivery').single().then(({ data }) => {
      if (data?.value) setSettings(data.value as DeliverySettings)
      setLoaded(true)
    })
  }, [])

  return { settings, loaded }
}

export function calcDelivery(subtotal: number, settings: DeliverySettings) {
  if (subtotal >= settings.free_threshold) return 0
  if (subtotal >= settings.min_order) return settings.fee
  return null
}
