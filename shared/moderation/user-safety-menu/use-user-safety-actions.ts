import { useState } from 'react';
import { useBlockUserMutation } from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { USER_SAFETY_MENU_COPY } from './const';

export default function useUserSafetyActions(userId: string) {
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = USER_SAFETY_MENU_COPY[language];
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isBlockConfirmationVisible, setIsBlockConfirmationVisible] = useState(false);
  const [blockUser, { isLoading }] = useBlockUserMutation();

  const confirmBlock = async () => {
    try {
      await blockUser(userId).unwrap();
      setIsBlockConfirmationVisible(false);
      successToast(copy.blocked);
    } catch (error) {
      errorToast(copy.blockError, error);
    }
  };

  return {
    copy,
    isReportVisible,
    isBlockConfirmationVisible,
    isLoading,
    showReport: () => setIsReportVisible(true),
    showBlockConfirmation: () => setIsBlockConfirmationVisible(true),
    dismissReport: () => setIsReportVisible(false),
    dismissBlockConfirmation: () => setIsBlockConfirmationVisible(false),
    confirmBlock,
  };
}
