import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { Likes, NUMBER_OF_LIKES } from './const';
import { useAuth } from '../../auth/context/auth-context';
import { errorExtracter } from '../../utils/error-handler';

export default function NumberOfLikes({
  likes,
  error,
}: {
  likes: Likes[];
  error: FetchBaseQueryError | SerializedError;
}) {
  const { user } = useAuth();
  const isOwnerLiked = likes.some(({ authorId }) => authorId === user?.id);
  const restLiked = isOwnerLiked ? likes.length - 1 : likes.length;
  const { language } = useSelector(({ language }) => language);

  return (
    <>
      {error && (
        <Text style={{ marginLeft: 65 }} variant="bodyMedium">
          {`${NUMBER_OF_LIKES[language].error}: ${errorExtracter(error)}`}
        </Text>
      )}
      {!error && (
        <Text style={{ marginLeft: 65 }} variant="bodyMedium">
          {`${isOwnerLiked ? NUMBER_OF_LIKES[language].you : ''}`}
          {isOwnerLiked && restLiked > 0 ? NUMBER_OF_LIKES[language].and : ''}
          {`${restLiked > 0 ? `${restLiked}` : ''} ${
            restLiked > 0 ? NUMBER_OF_LIKES[language].manyGaveLikes : NUMBER_OF_LIKES[language].oneGaveLikes
          }`}
        </Text>
      )}
    </>
  );
}
