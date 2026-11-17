# Smart Timetable

A responsive, no-AI student timetable and reminder website.

## Features
- Add, edit, delete, and complete activities.
- Set time, duration, instructions, and a custom reminder message.
- First reminder appears at the scheduled time.
- If there is no response, an alarm sound starts after five minutes (when enabled).
- Start, snooze for five minutes, or mark the activity done.
- Daily completion dashboard and task filters.
- Optional browser notifications (permission required).
- Upload a timetable image as a visual reference. In this version, image text/times are not automatically extracted; add activities manually.
- Data is saved in browser LocalStorage.

## Run
1. Extract the ZIP.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. Add your activities.
4. Keep the page open for scheduled reminders.
5. Click **Enable notifications** and allow permission if you want browser notifications.

For best results, use VS Code Live Server or host the site over HTTPS.

## Important limitations
Browser reminders and the five-minute alarm work while the page is open and running. If the browser is closed, the computer sleeps, or the browser suspends the page, alarms are not guaranteed. Notifications also depend on browser and operating-system permissions. Reliable background alarms need a service worker/push setup or a native mobile/desktop app.
