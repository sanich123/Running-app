# Android app links

The Expo Android config registers the production and Stage web hosts for sign-in and activity links:

- `https://runich-app.ru/login-from-url`
- `https://runich-app.ru/activity`
- `https://stage-web.runich-app.ru/login-from-url`
- `https://stage-web.runich-app.ru/activity`

Android verification is served by `public/.well-known/assetlinks.json` on both hosts. The former Netlify hosts remain registered during the hosting migration.
