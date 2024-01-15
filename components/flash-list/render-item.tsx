import ActivityCard from '@C/card/card';
import { ActivityCardProps } from '@C/card/const ';

export type ActivitiesType = (ActivityCardProps & { user_id: string })[];

export function renderCardsFunction({ item }: { item: ActivityCardProps & { user_id: string } }) {
  const { description, title, date, sport, locations, photoUrls, duration, distance, id, user_id } = item;
  return (
    <ActivityCard
      isShowDeleteBtn={false}
      isShowDescription={false}
      description={description}
      title={title}
      date={date}
      sport={sport}
      userId={user_id}
      id={id}
      locations={locations}
      key={id}
      photoUrls={photoUrls}
      duration={duration}
      distance={distance}
      fullViewRef={{ current: null }}
    />
  );
}
