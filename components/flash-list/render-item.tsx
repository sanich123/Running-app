import Card from '@C/card/card';
import { ActivityCardProps } from '@C/card/const ';

export type ActivitiesType = (ActivityCardProps & { user_id: string })[];

export function renderCardsFunction({ item }: { item: ActivityCardProps & { user_id: string } }) {
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
    likes,
    comments,
    profile,
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
      likes={likes}
      comments={comments}
      profile={profile}
    />
  );
}

export const keyExtractor = (_: unknown, index: number) => `activity-${index}`;
