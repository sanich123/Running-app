import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { useCreateGroupEventMutation } from '@R/services/groups/groups';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { errorToast } from '@S/error-toast/error-toast';
import type { GroupEventFormValues, GroupEventsCopy } from '../types';

export default function GroupEventForm({ groupId, copy }: { groupId: string; copy: GroupEventsCopy }) {
  const { colors } = useTheme();
  const [defaultStartsAt] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const { control, watch, reset } = useForm<GroupEventFormValues>({
    defaultValues: { title: '', description: '', locationName: '', startsAt: defaultStartsAt },
  });
  const title = watch('title');
  const startsAt = watch('startsAt');
  const [createEvent, { isLoading: isCreating }] = useCreateGroupEventMutation();

  return (
    <Surface style={[styles.form, { backgroundColor: colors.surface }]} elevation={1}>
      <Text variant="titleLarge" style={styles.formTitle}>
        {copy.createEvent}
      </Text>
      <CustomTextInput<GroupEventFormValues>
        control={control}
        fieldName="title"
        label={copy.eventTitle}
        maxLength={120}
        testID="group-event-title-input"
        validation={{ required: '' }}
      />
      <CustomTextInput<GroupEventFormValues>
        control={control}
        fieldName="description"
        label={copy.eventDescription}
        maxLength={2000}
        multiline
        validation={{ required: '' }}
      />
      <CustomTextInput<GroupEventFormValues>
        control={control}
        fieldName="locationName"
        label={copy.eventLocation}
        maxLength={160}
        validation={{ required: '' }}
      />
      <CustomTextInput<GroupEventFormValues>
        control={control}
        fieldName="startsAt"
        label={copy.eventStartsAt}
        autoCapitalize="none"
        testID="group-event-date-input"
        validation={{ required: '' }}
      />
      <Button
        mode="contained"
        testID="group-event-submit"
        disabled={!title.trim() || new Date(startsAt).getTime() <= Date.now() || isCreating}
        loading={isCreating}
        onPress={async () => {
          if (!title.trim()) return;
          const date = new Date(startsAt);
          if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
            errorToast(copy.eventDateInvalid);
            return;
          }
          try {
            await createEvent({
              groupId,
              title: title.trim(),
              description: watch('description').trim() || undefined,
              locationName: watch('locationName').trim() || undefined,
              startsAt: date.toISOString(),
            }).unwrap();
            reset({ title: '', description: '', locationName: '', startsAt });
          } catch (error) {
            errorToast(copy.eventError, error);
          }
        }}>
        {copy.createEvent}
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  form: { borderRadius: 20, gap: 12, padding: 16 },
  formTitle: { fontWeight: '700' },
});
