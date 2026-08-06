import Card from '@Routes/card/card';
import type { ActivityCardProps } from '@Routes/card/types';

export type ActivitiesType = ActivityCardProps & { user_id: string; _count: { comments: number } };

export function renderCardsFunction({ item }: { item: ActivitiesType }) {
  const {
    description,
    title,
    date,
    sport,
    photoVideoUrls,
    mapPhotoUrl,
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
      description={description}
      title={title}
      date={date}
      sport={sport}
      userId={user_id}
      id={id}
      key={id}
      mapPhotoUrl={mapPhotoUrl}
      photoVideoUrls={photoVideoUrls}
      duration={duration}
      distance={distance}
      profile={profile}
      commentsLength={commentsLength}
    />
  );
}

export const keyExtractor = (_: unknown, index: number) => `activity-${index}`;
