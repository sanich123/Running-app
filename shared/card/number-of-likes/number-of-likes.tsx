import { Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { NUMBER_OF_LIKES } from './const';
import type { NumberOfLikesProps } from '../types';

export default function NumberOfLikes({ likes, likesLength }: NumberOfLikesProps) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const isOwnerLiked = likes.some(({ authorId }) => authorId === userId);
  const totalLikes = likesLength ?? likes.length;
  const restLiked = isOwnerLiked ? totalLikes - 1 : totalLikes;
  const { language } = useAppSelector(({ settings }) => settings);
  const twoIcons = totalLikes === 2;
  const threeIcons = totalLikes >= 3;

  return (
    <Text
      style={[{ marginLeft: 20 }, twoIcons && { marginLeft: 45 }, threeIcons && { marginLeft: 65 }]}
      variant="bodyMedium">
      {`${isOwnerLiked ? NUMBER_OF_LIKES[language].you : ''}`}
      {isOwnerLiked && restLiked > 0 ? NUMBER_OF_LIKES[language].and : ''}
      {`${restLiked > 0 ? `${restLiked}` : ''} ${
        totalLikes === 1 ? NUMBER_OF_LIKES[language].oneGaveLikes : NUMBER_OF_LIKES[language].manyGaveLikes
      }`}
    </Text>
  );
}
