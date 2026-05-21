import { useEffect, useState } from 'react'

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
    fetch('/api/public-settings')
      .then(res => res.json())
      .then(data => {
        if (data?.delivery) setSettings(data.delivery as DeliverySettings)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  return { settings, loaded }
}

export function calcDelivery(subtotal: number, settings: DeliverySettings) {
  if (subtotal >= settings.free_threshold) return 0
  if (subtotal >= settings.min_order) return settings.fee
  return null
}
