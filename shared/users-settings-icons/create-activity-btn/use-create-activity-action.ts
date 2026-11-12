import { useRouter } from 'expo-router';
import { ACTIVITY_VISIBILITY } from '@const/activity-visibility';
import { ROUTES } from '@const/enums';
import { resetActivityDraft, resetFinishedActivity } from '@R/slices/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';

export default function useCreateActivityAction() {
  const { push } = useRouter();
  const dispatch = useAppDispatch();

  return () => {
    dispatch(resetActivityDraft());
    dispatch(resetFinishedActivity());
    push({
      pathname: `/${ROUTES.manualActivity}`,
      params: {
        cameraVisible: 'false',
        manualDate: new Date().toISOString(),
        manualDistance: '0',
        manualHours: '0',
        manualMinutes: '0',
        manualSeconds: '0',
        mode: 'manual',
        title: '',
        description: '',
        sport: 'run',
        emotion: 'normal',
        visibility: ACTIVITY_VISIBILITY.followers,
      },
    });
  };
}
