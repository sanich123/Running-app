import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, RadioButton, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { useSendFeedbackMutation } from '@R/services/feedback/feedback';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { deviceMetadata, deviceName, platform } from '@U/device/device-id';

type FeedbackKind = 'bug' | 'thanks' | 'feature';

export default function FeedbackPage() {
  const { colors } = useTheme();
  const { back } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [firstConsent, setFirstConsent] = useState(false);
  const [secondConsent, setSecondConsent] = useState(false);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [sendFeedback, { isLoading }] = useSendFeedbackMutation();

  const isBug = kind === 'bug';
  const isFeature = kind === 'feature';
  const canWrite = kind === 'thanks' || (isBug && secondConsent) || (isFeature && secondConsent);

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (!result.canceled) setPhoto(result.assets[0]);
    } catch (error) {
      errorToast('Не удалось открыть галерею', error);
    }
  }

  async function submit() {
    if (!kind || !text.trim() || !canWrite) return;
    const body = new FormData();
    body.append('kind', kind);
    body.append('userId', userId);
    body.append('text', text.trim());
    body.append('deviceInfo', JSON.stringify({ platform, deviceName, ...deviceMetadata }));
    if (photo) {
      body.append('photo', {
        uri: photo.uri,
        name: photo.fileName ?? 'feedback-photo.jpg',
        type: photo.mimeType ?? 'image/jpeg',
      } as never);
    }
    try {
      await sendFeedback(body).unwrap();
      back();
    } catch (error) {
      errorToast('Не удалось отправить обратную связь', error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: colors.background }}>
      <Card mode="contained" style={{ backgroundColor: colors.surface }}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleLarge">Обратная связь</Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            Выбери, чем хочешь поделиться с разработчиком.
          </Text>
          <RadioButton.Group
            onValueChange={(value) => {
              setKind(value as FeedbackKind);
              setFirstConsent(false);
              setSecondConsent(false);
            }}
            value={kind ?? ''}>
            <RadioButton.Item label="Поведать о баге" value="bug" />
            <RadioButton.Item label="Поблагодарить разработчика" value="thanks" />
            <RadioButton.Item label="Хочу фичу" value="feature" />
          </RadioButton.Group>

          {(isBug || isFeature) && (
            <View style={styles.switches}>
              <SwitchRow
                label="Runich полностью бесплатный сервис"
                value={firstConsent}
                onValueChange={setFirstConsent}
              />
              {firstConsent && (
                <SwitchRow
                  label="Runich полностью был написан и поддерживается одним разработчиком в свободное от работы время"
                  value={secondConsent}
                  onValueChange={setSecondConsent}
                />
              )}
            </View>
          )}
          {canWrite && (
            <>
              <TextInput
                mode="outlined"
                multiline
                value={text}
                onChangeText={setText}
                placeholder={
                  isBug
                    ? 'Максимально точно опишите, при каком сценарии можно воспроизвести баг'
                    : isFeature
                      ? 'Опишите желаемую функцию'
                      : 'Напишите сообщение разработчику'
                }
                style={styles.textInput}
              />
              {(isBug || isFeature) && (
                <Button icon="image-plus" mode="outlined" onPress={() => void choosePhoto()}>
                  {photo ? 'Фото выбрано' : 'Добавить фото/скриншот'}
                </Button>
              )}
              <Button
                mode="contained"
                disabled={!text.trim() || isLoading}
                loading={isLoading}
                onPress={() => void submit()}>
                Послать
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 8 },
  cardContent: { gap: 12 },
  switches: { gap: 8 },
  switchRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  switchLabel: { flex: 1 },
  textInput: { minHeight: 140 },
});
