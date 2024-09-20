import { useState } from 'react';

export default function useGetStates() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isUnzipping, setIsUnzipping] = useState(false);
  const [isRemovingMedia, setIsRemovingMedia] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isSendingArchive, setIsSendingArchive] = useState(false);
  const [isDeletingCacheFolder, setIsDeletingCacheFolder] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState('');
  const isInitial =
    !isDisabled &&
    !isUnzipping &&
    !isRemovingMedia &&
    !isZipping &&
    !isSendingArchive &&
    !isDeletingCacheFolder &&
    !isSuccess &&
    !isError;
  return {
    isDisabled,
    setIsDisabled,
    isUnzipping,
    setIsUnzipping,
    isRemovingMedia,
    setIsRemovingMedia,
    isZipping,
    setIsZipping,
    isSendingArchive,
    setIsSendingArchive,
    isDeletingCacheFolder,
    setIsDeletingCacheFolder,
    isSuccess,
    setIsSuccess,
    isError,
    setIsError,
    isInitial,
  };
}
