import { memo } from 'react';
import { Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { NUMBER_OF_LIKES } from './const';
import type { NumberOfLikesProps } from '../types';

export default memo(function NumberOfLikes({ likes }: NumberOfLikesProps) {
  const { userId } = useAppSelector(({ auth }) => auth);
  const isOwnerLiked = likes.some(({ authorId }) => authorId === userId);
  const restLiked = isOwnerLiked ? likes.length - 1 : likes.length;
  const { language } = useAppSelector(({ settings }) => settings);
  const twoIcons = likes.length === 2;
  const threeIcons = likes.length >= 3;

  return (
    <Text
      style={[{ marginLeft: 20 }, twoIcons && { marginLeft: 45 }, threeIcons && { marginLeft: 65 }]}
      variant="bodyMedium">
      {`${isOwnerLiked ? NUMBER_OF_LIKES[language].you : ''}`}
      {isOwnerLiked && restLiked > 0 ? NUMBER_OF_LIKES[language].and : ''}
      {`${restLiked > 0 ? `${restLiked}` : ''} ${
        likes.length === 1 ? NUMBER_OF_LIKES[language].oneGaveLikes : NUMBER_OF_LIKES[language].manyGaveLikes
      }`}
    </Text>
  );
});
