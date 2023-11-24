import { useAuth } from '@A/context/auth-context';
import { errorExtracter } from '@U/error-handler';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { NumOfLikesProps, NUMBER_OF_LIKES } from './const';

export default function NumberOfLikes({ likes, error }: NumOfLikesProps) {
  const { user } = useAuth();
  const isOwnerLiked = likes.some(({ authorId }) => authorId === user?.id);
  const restLiked = isOwnerLiked ? likes.length - 1 : likes.length;
  const { language } = useSelector(({ language }) => language);
  const twoIcons = likes.length === 2;
  const threeIcons = likes.length >= 3;

  return (
    <>
      {error && (
        <Text style={{ marginLeft: 65 }} variant="bodyMedium">
          {`${NUMBER_OF_LIKES[language as keyof typeof NUMBER_OF_LIKES].error}: ${errorExtracter(error)}`}
        </Text>
      )}
      {!error && (
        <Text
          style={[{ marginLeft: 20 }, twoIcons && { marginLeft: 20 }, threeIcons && { marginLeft: 65 }]}
          variant="bodyMedium">
          {`${isOwnerLiked ? NUMBER_OF_LIKES[language as keyof typeof NUMBER_OF_LIKES].you : ''}`}
          {isOwnerLiked && restLiked > 0 ? NUMBER_OF_LIKES[language as keyof typeof NUMBER_OF_LIKES].and : ''}
          {`${restLiked > 0 ? `${restLiked}` : ''} ${
            restLiked > 0
              ? NUMBER_OF_LIKES[language as keyof typeof NUMBER_OF_LIKES].manyGaveLikes
              : NUMBER_OF_LIKES[language as keyof typeof NUMBER_OF_LIKES].oneGaveLikes
          }`}
        </Text>
      )}
    </>
  );
}
