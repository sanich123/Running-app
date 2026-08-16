import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import SettingsRow from '../settings-row/settings-row';

export default function FeedbackBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { push } = useRouter();
  return (
    <SettingsRow
      testID="feedback-btn"
      icon="message-text-outline"
      title={language === 'russian' ? 'Обратная связь' : 'Feedback'}
      description={
        language === 'russian' ? 'Расскажи о проблеме или предложи идею' : 'Report a problem or suggest an idea'
      }
      onPress={() => push(`/${ROUTES.feedback}`)}
    />
  );
}
