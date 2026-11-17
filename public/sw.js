/* CareCircle service worker.
   Today: lets the app show notifications on iPhone (Home Screen install).
   Backend team: handle real Web Push here — the server sends a push message
   at reminder time and this 'push' handler shows it. */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = { title: 'CareCircle', body: 'You have a reminder.' }
  try {
    data = event.data ? event.data.json() : data
  } catch {
    data.body = event.data ? event.data.text() : data.body
  }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: data.tag || 'carecircle' }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus()
      return self.clients.openWindow('/')
    }),
  )
})
