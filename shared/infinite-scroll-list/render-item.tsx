import Card from '@S/card/card';
import type { ActivityResponse } from '@R/runich-api/types';

type ActivityListItem = ActivityResponse;

export function renderCardsFunction({ item }: { item: ActivityListItem }) {
  const {
    description,
    title,
    date,
    sport,
    photoVideoUrls,
    mapPhotoUrl,
    locations,
    duration,
    distance,
    id,
    user_id,
    profile,
    _count: { comments: commentsLength },
  } = item;

  return (
    <Card
      isShowDeleteBtn={false}
      isShowDescription={false}
      description={description ?? ''}
      title={title ?? ''}
      date={date}
      sport={sport}
      userId={user_id}
      id={id}
      key={id}
      mapPhotoUrl={mapPhotoUrl}
      locations={locations}
      photoVideoUrls={photoVideoUrls}
      duration={duration}
      distance={distance}
      profile={profile}
      commentsLength={commentsLength}
    />
  );
}

export const keyExtractor = (item: ActivityListItem) => item.id;
