/**
 * Local (on-device) notifications for the demo.
 *
 * iPhone note: web push only works when the app is added to the Home Screen
 * (Share → Add to Home Screen, iOS 16.4+) and the user allows notifications.
 * Real scheduled push (a reminder at 7:00 AM while the app is closed) needs a
 * backend that sends Web Push messages — see README → Backend hand-off.
 */
export type PushPermission = NotificationPermission | 'unsupported'

export function pushSupport(): PushPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (pushSupport() === 'unsupported') return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/** Show a system notification now. Returns false if it could not be shown. */
export async function showSystemNotification(title: string, body: string): Promise<boolean> {
  if (pushSupport() !== 'granted') return false
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: 'carecircle-reminder' })
      return true
    }
    new Notification(title, { body, icon: '/icons/icon-192.png' })
    return true
  } catch {
    return false
  }
}
