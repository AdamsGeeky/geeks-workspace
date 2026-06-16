import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Notification, Envelope } from '@/types'

export function useUnreadNotificationCount() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<Envelope<Notification[]>>('/notifications')
      return res.data.data ?? res.data
    },
    staleTime: 15_000,
  })

  const notifications = Array.isArray(data) ? data : []
  return notifications.filter((n) => !n.isRead).length
}
