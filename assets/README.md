
# MediTime - Medicine Reminder App

MediTime is a responsive medicine reminder and medication tracking web application.

## Features

- Add, edit and delete medicines
- Medicine name and dosage
- Daily reminder time
- Daily, weekdays and weekly schedules
- Before food, after food and with food instructions
- Medicine photo upload
- Medicine stock tracking
- Taken and missed dose history
- Daily progress dashboard
- Ten-minute snooze
- Browser notifications
- Voice reminder
- Dark mode
- Large text option
- Responsive mobile-friendly interface
- Basic offline support with service worker
- Installable Progressive Web App setup

## Technologies

- HTML5
- CSS3
- JavaScript
- Browser Local Storage
- Web Notifications API
- Web Audio API
- Service Workers

## Run locally

Open index.html in a browser, or run a local web server:

python -m http.server 8000

Then visit:

http://localhost:8000

## Deploy on GitHub Pages

1. Upload all project files to your GitHub repository.
2. Open repository Settings.
3. Select Pages.
4. Under Build and deployment, select Deploy from a branch.
5. Select the main branch and root folder.
6. Click Save.
7. Wait for GitHub Pages to publish the website.

## Important limitations

This is a browser-based reminder prototype.

- Reminders work while the app page is active.
- Browser notifications depend on permission and browser support.
- Browser timers and audio may stop when the browser is closed or the device sleeps.
- Reliable background reminders require a push notification backend.
- Caregiver details are stored locally; no automatic messages are sent.
- Data is stored in the current browser and is not automatically synced.
- The language selector currently saves a language preference; full Urdu translation is not yet implemented.
- Weekly scheduling uses the weekday on which the medicine was first added.

Do not rely on this prototype as the only reminder for critical medication.
Always follow your healthcare professional's instructions.
