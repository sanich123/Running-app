/* global module */

const UNIVERSAL_LINK_HOSTS = ['runich-app.ru', 'stage-web.runich-app.ru'];
const UNIVERSAL_LINK_PATH_PREFIXES = ['/login-from-url', '/activity', '/admin', '/groups'];

const ANDROID_UNIVERSAL_LINK_FILTERS = UNIVERSAL_LINK_HOSTS.flatMap((host) =>
  UNIVERSAL_LINK_PATH_PREFIXES.map((pathPrefix) => ({
    action: 'VIEW',
    autoVerify: true,
    data: [{ scheme: 'https', host, pathPrefix }],
    category: ['BROWSABLE', 'DEFAULT'],
  })),
);

module.exports = { ANDROID_UNIVERSAL_LINK_FILTERS };
