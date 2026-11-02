import { useState } from 'react';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, Surface, Text, useTheme } from 'react-native-paper';
import { useForm, useWatch } from 'react-hook-form';
import { LANGUAGES } from '@const/enums';
import { useCreateGroupEventMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { DATE_TIME_PICKER } from '@Routes/save-activity-page/date-picker/const';
import { formatSelectedDate, setTimeOnDate } from '@Routes/save-activity-page/date-picker/utils';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { errorToast } from '@S/error-toast/error-toast';
import { GROUP_SPORTS } from '../../const';
import type { GroupEventFormValues, GroupEventsCopy } from '../types';
import type { GroupSport } from '@R/services/groups/types';
import '@Routes/save-activity-page/date-picker/date-time-picker/register-translations';

export default function GroupEventForm({
  groupId,
  groupSports = GROUP_SPORTS,
  copy,
  onCreated,
}: {
  groupId: string;
  groupSports?: GroupSport[];
  copy: GroupEventsCopy;
  onCreated?: () => void;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const availableSports = groupSports.length ? groupSports : GROUP_SPORTS;
  const [startsAt, setStartsAt] = useState(() => new Date(Date.now() + 86400000));
  const [selectedDate, setSelectedDate] = useState(startsAt);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const sport: GroupSport = availableSports[0] ?? 'run';
  const { control, reset } = useForm<GroupEventFormValues>({
    defaultValues: { title: '', description: '', locationName: '', distanceKm: '' },
  });
  const title = useWatch({ control, name: 'title', defaultValue: '' });
  const distanceText = useWatch({ control, name: 'distanceKm', defaultValue: '' });
  const description = useWatch({ control, name: 'description', defaultValue: '' });
  const locationName = useWatch({ control, name: 'locationName', defaultValue: '' });
  const [createEvent, { isLoading: isCreating }] = useCreateGroupEventMutation();
  const dateTimeCopy = DATE_TIME_PICKER[language];

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
        fieldName="distanceKm"
        label={copy.eventDistance}
        inputMode="decimal"
        maxLength={6}
        validation={{ required: '' }}
        testID="group-event-distance-input"
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
      <View style={styles.field}>
        <Text variant="labelLarge">{copy.eventStartsAt}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.eventStartsAt}
          testID="group-event-date-input"
          onPress={() => {
            setSelectedDate(startsAt);
            setDatePickerOpen(true);
          }}
          style={[styles.dateButton, { borderColor: colors.outlineVariant }]}>
          <Icon source="calendar-edit" size={22} color={colors.onSurfaceVariant} />
          <Text variant="bodyLarge" style={styles.dateText}>
            {formatSelectedDate(startsAt, language)}
          </Text>
          <Icon source="chevron-down" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
      <Button
        mode="contained"
        testID="group-event-submit"
        disabled={isCreating}
        loading={isCreating}
        onPress={async () => {
          if (title.trim().length < 2) return errorToast(copy.eventTitleInvalid);
          if (startsAt.getTime() <= Date.now()) return errorToast(copy.eventDateInvalid);
          const normalizedDistanceText = distanceText.trim().replace(',', '.');
          const distanceKm = normalizedDistanceText ? Number(normalizedDistanceText) : undefined;
          if (
            normalizedDistanceText &&
            (!/^\d+(\.\d)?$/.test(normalizedDistanceText) || !distanceKm || distanceKm > 500)
          ) {
            return errorToast(copy.eventDistanceInvalid);
          }
          try {
            await createEvent({
              groupId,
              title: title.trim(),
              sport,
              ...(distanceKm !== undefined ? { distanceKm } : {}),
              description: description.trim() || undefined,
              locationName: locationName.trim() || undefined,
              startsAt: startsAt.toISOString(),
            }).unwrap();
            if (onCreated) onCreated();
            else reset({ title: '', description: '', locationName: '', distanceKm: '' });
          } catch (error) {
            errorToast(copy.eventError, error);
          }
        }}>
        {copy.createEvent}
      </Button>
      <DatePickerModal
        mode="single"
        visible={datePickerOpen}
        date={selectedDate}
        locale={language === LANGUAGES.english ? 'en' : 'ru'}
        label={dateTimeCopy.title}
        saveLabel={dateTimeCopy.confirm}
        startWeekOnMonday
        validRange={{ startDate: new Date() }}
        onDismiss={() => setDatePickerOpen(false)}
        onConfirm={({ date }) => {
          if (!date) return;
          setDatePickerOpen(false);
          setSelectedDate(date);
          setTimePickerOpen(true);
        }}
      />
      <TimePickerModal
        visible={timePickerOpen}
        locale={language === LANGUAGES.english ? 'en' : 'ru'}
        label={dateTimeCopy.timeTitle}
        cancelLabel={dateTimeCopy.cancel}
        confirmLabel={dateTimeCopy.confirm}
        use24HourClock
        hours={selectedDate.getHours()}
        minutes={selectedDate.getMinutes()}
        onDismiss={() => setTimePickerOpen(false)}
        onConfirm={({ hours, minutes }) => {
          setStartsAt(setTimeOnDate(selectedDate, hours, minutes));
          setTimePickerOpen(false);
        }}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  form: { borderRadius: 20, gap: 12, padding: 16 },
  formTitle: { fontWeight: '700' },
  field: { gap: 8 },
  dateButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  dateText: { flex: 1 },
});
