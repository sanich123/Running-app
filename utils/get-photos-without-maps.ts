export function getPhotosWithoutMaps(photos: [{ photoUrls: string[] }]) {
  return photos
    ?.map(({ photoUrls }) => photoUrls)
    .flat()
    .filter((photoUrl) => !photoUrl.includes('api.mapbox.com'));
}
