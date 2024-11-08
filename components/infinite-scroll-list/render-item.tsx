import Card from '@C/card/card';
import { ActivityCardProps } from '@C/card/types';

export type ActivitiesType = (ActivityCardProps & { user_id: string })[];

export function renderCardsFunction({
  item,
}: {
  item: ActivityCardProps & { user_id: string; _count: { comments: number } };
}) {
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
