import { useEffect, useState } from 'react';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { UPLOAD_PHOTO_BTN } from './ const';
import { useAuth } from '../../auth/context/auth-context';
import { getSignedUrl } from '../../auth/supabase/storage/upload-photo';
import { EXPIRED_TIME } from '../../constants/const';
import { savePhotoUrls } from '../../redux/activity/activity';
import { errorHandler } from '../../utils/error-handler';
import { compressAndSendPhoto, getAccessToGallery } from '../../utils/file-sending';
import PreviewImages from '../preview-images/preview-images';

type UploadPhotoBtnProps = {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
};

export default function UploadPhotosBtn({ isDisabled, setIsDisabled }: UploadPhotoBtnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { isDisabledWhileSending, isNeedToResetInputs } = useSelector(({ activity }) => activity);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);

  useEffect(() => {
    if (isNeedToResetInputs) {
      dispatch(savePhotoUrls([]));
      setImages([]);
    }
  }, [isNeedToResetInputs]);

  return (
    <>
      <Button
        mode="outlined"
        icon="camera"
        onPress={async () => {
          setIsDisabled(true);
          setIsLoading(true);
          try {
            const result = await getAccessToGallery();
            if (!result.canceled) {
              const imgSrc = result.assets[0].uri;
              const pathToPhoto = await compressAndSendPhoto(imgSrc, user.id);
              console.log(pathToPhoto);
              const url = await getSignedUrl(pathToPhoto, EXPIRED_TIME);
              setImages([...images, url]);
              dispatch(savePhotoUrls([...images, url]));
            }
          } catch (error) {
            errorHandler(error);
          } finally {
            setIsDisabled(false);
            setIsLoading(false);
          }
        }}
        style={{ marginTop: 15 }}
        loading={isLoading}
        disabled={isDisabled || isDisabledWhileSending}>
        {isLoading ? UPLOAD_PHOTO_BTN[language].isLoading : UPLOAD_PHOTO_BTN[language].isInitial}
      </Button>
      <PreviewImages images={images} setImages={setImages} isDisabled={isDisabled} />
    </>
  );
}
