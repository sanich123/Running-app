interface AndroidUniversalLinkFilter {
  action: 'VIEW';
  autoVerify: true;
  data: [{ scheme: 'https'; host: string; pathPrefix: string }];
  category: ['BROWSABLE', 'DEFAULT'];
}

export const ANDROID_UNIVERSAL_LINK_FILTERS: AndroidUniversalLinkFilter[];
