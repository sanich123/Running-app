const PRODUCTION_CDN_ORIGIN = 'https://q0tsp3wn9v.cdn.twcstorage.ru';
const PRODUCTION_BUCKET_URL = 'https://s3.twcstorage.ru/runich-production';

export function getProductionBucketFallbackUri(uri: string) {
  try {
    const sourceUrl = new URL(uri);
    if (
      sourceUrl.origin !== PRODUCTION_CDN_ORIGIN ||
      sourceUrl.pathname === '/' ||
      sourceUrl.username ||
      sourceUrl.password
    ) {
      return null;
    }

    return `${PRODUCTION_BUCKET_URL}${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`;
  } catch {
    return null;
  }
}
