import Card from '@C/card/card';
import { ActivityCardProps } from '@C/card/const ';

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
    likes,
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
      fullViewRef={{ current: null }}
      profile={profile}
      likes={likes}
      commentsLength={commentsLength}
    />
  );
}

export const keyExtractor = (_: unknown, index: number) => `activity-${index}`;
