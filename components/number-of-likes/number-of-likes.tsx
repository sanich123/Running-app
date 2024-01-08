import { useAuth } from '@A/context/auth-context';
import { useAppSelector } from '@R/typed-hooks';
import { errorExtracter } from '@U/error-handler';
import { Text } from 'react-native-paper';

import { NumOfLikesProps, NUMBER_OF_LIKES } from './const';

export default function NumberOfLikes({ likes, error }: NumOfLikesProps) {
  const { user } = useAuth();
  const isOwnerLiked = likes.some(({ authorId }) => authorId === user?.id);
  const restLiked = isOwnerLiked ? likes.length - 1 : likes.length;
  const { language } = useAppSelector(({ language }) => language);
  const twoIcons = likes.length === 2;
  const threeIcons = likes.length >= 3;

  return (
    <>
      {error && (
        <Text style={{ marginLeft: 65 }} variant="bodyMedium">
          {`${NUMBER_OF_LIKES[language].error}: ${errorExtracter(error)}`}
        </Text>
      )}
      {!error && (
        <Text
          style={[{ marginLeft: 20 }, twoIcons && { marginLeft: 45 }, threeIcons && { marginLeft: 65 }]}
          variant="bodyMedium">
          {`${isOwnerLiked ? NUMBER_OF_LIKES[language].you : ''}`}
          {isOwnerLiked && restLiked > 0 ? NUMBER_OF_LIKES[language].and : ''}
          {`${restLiked > 0 ? `${restLiked}` : ''} ${
            likes.length === 1 ? NUMBER_OF_LIKES[language].oneGaveLikes : NUMBER_OF_LIKES[language].manyGaveLikes
          }`}
        </Text>
      )}
    </>
  );
}
