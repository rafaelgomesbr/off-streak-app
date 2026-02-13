// No Scroll Streak Service Worker for Push Notifications

const CACHE_NAME = "noscroll-v3"

// Install event - clear old caches
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(self.clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event)
  
  let data = {
    title: "No Scroll Streak",
    body: "Time to check in!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "noscroll-reminder",
  }

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch (e) {
      data.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: "open", title: "Open App" },
        { action: "dismiss", title: "Dismiss" },
      ],
    })
  )
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)
  
  event.notification.close()

  if (event.action === "dismiss") {
    return
  }

  // Open the app
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      // If no window is open, open a new one
      return self.clients.openWindow("/")
    })
  )
})

// Periodic sync for scheduled notifications (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "offstreak-morning" || event.tag === "offstreak-evening") {
    event.waitUntil(showScheduledNotification(event.tag))
  }
})

async function showScheduledNotification(type) {
  const isMorning = type === "offstreak-morning"
  
  const title = isMorning ? "☀️ Good morning!" : "🌙 End of day!"
  const body = isMorning 
    ? "Ready to start another focused day?" 
    : "How did you do today? Time to check in!"

  await self.registration.showNotification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: type,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: "open", title: isMorning ? "Start Day" : "Check In" },
      { action: "dismiss", title: "Later" },
    ],
  })
}

// Message handler for manual notification triggers
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag } = event.data
    self.registration.showNotification(title, {
      body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: tag || "offstreak-manual",
      vibrate: [200, 100, 200],
    })
  }
})
