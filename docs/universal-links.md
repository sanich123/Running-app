# App links

Production and Stage app links use the web hosts below:

- `https://runich-app.ru/login-from-url`
- `https://runich-app.ru/activity`
- `https://runich-app.ru/admin`
- `https://runich-app.ru/groups/{groupId}`
- `https://runich-app.ru/vk_id_redirect` (VK ID native sign-in callback)
- `https://stage-web.runich-app.ru/login-from-url`
- `https://stage-web.runich-app.ru/activity`
- `https://stage-web.runich-app.ru/admin`
- `https://stage-web.runich-app.ru/groups/{groupId}`

Android verification is served by `public/.well-known/assetlinks.json` on both Timeweb hosts. iOS verification is served by `public/.well-known/apple-app-site-association`; both hosts must serve it directly over HTTPS. The app config registers both hosts as iOS Associated Domains and Android verified links.

The VK ID callback path is included in the production AASA file so iOS can return the Universal Link to the app and the VK ID SDK can finish authorization.

The moderation email links to `/admin?reportId=...` (and includes appeal query parameters when needed), so the app router opens the moderation page directly when the link is tapped on a device with the app installed.
