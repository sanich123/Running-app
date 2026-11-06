import type * as ReactTypes from 'react';
import { screen, userEvent, waitFor } from '@testing-library/react-native';
import type * as ReactNativeTypes from 'react-native';
import type * as ReactNativePaperTypes from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventForm from './group-event-form';
import { GROUPS_COPY, GROUP_SPORT_LABELS } from '../../const';

const mockCreateEvent = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('@R/services/groups/groups', () => ({
  useCreateGroupEventMutation: () => [mockCreateEvent, { isLoading: false }],
}));
jest.mock('react-native-paper-dates', () => {
  const ReactModule = jest.requireActual('react') as typeof ReactTypes;
  const { View } = jest.requireActual('react-native') as typeof ReactNativeTypes;
  const { Button } = jest.requireActual('react-native-paper') as typeof ReactNativePaperTypes;
  interface MockDatePickerProps {
    visible: boolean;
    onConfirm: (value: { date: Date | null }) => void;
    onDismiss: () => void;
  }
  interface MockTimePickerProps {
    visible: boolean;
    onConfirm: (value: { hours: number; minutes: number }) => void;
    onDismiss: () => void;
  }
  return {
    DatePickerModal: ({ visible, onConfirm, onDismiss }: MockDatePickerProps) =>
      visible
        ? ReactModule.createElement(
            View,
            null,
            ReactModule.createElement(Button, {
              testID: 'group-event-date-confirm',
              onPress: () => onConfirm({ date: new Date(Date.now() + 3 * 86400000) }),
              children: 'Select date',
            }),
            ReactModule.createElement(Button, {
              testID: 'group-event-date-empty',
              onPress: () => onConfirm({ date: null }),
              children: 'Skip date',
            }),
            ReactModule.createElement(Button, {
              testID: 'group-event-date-dismiss',
              onPress: onDismiss,
              children: 'Close date',
            }),
          )
        : null,
    TimePickerModal: ({ visible, onConfirm, onDismiss }: MockTimePickerProps) =>
      visible
        ? ReactModule.createElement(
            View,
            null,
            ReactModule.createElement(Button, {
              testID: 'group-event-time-confirm',
              onPress: () => onConfirm({ hours: 10, minutes: 30 }),
              children: 'Select time',
            }),
            ReactModule.createElement(Button, {
              testID: 'group-event-time-dismiss',
              onPress: onDismiss,
              children: 'Close time',
            }),
          )
        : null,
    en: {},
    ru: {},
    registerTranslation: jest.fn(),
  };
});
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));

describe('GroupEventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockCreateEvent.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'event-1' }) });
  });

  it('submits a future event with trimmed required details and no distance', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Sunday long run');
    await user.type(screen.getByTestId(copy.eventDescription), '  Meet by the river  ');
    await user.type(screen.getByTestId(copy.eventLocation), '  Riverside park  ');
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() =>
      expect(mockCreateEvent).toHaveBeenCalledWith({
        groupId: 'group-1',
        title: 'Sunday long run',
        description: 'Meet by the river',
        locationName: 'Riverside park',
        sport: 'run',
        startsAt: expect.any(String),
      }),
    );
    const startsAt = new Date(mockCreateEvent.mock.calls[0][0].startsAt);
    expect(startsAt.toString()).not.toBe('Invalid Date');
    expect(startsAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('shows an error when event submission fails', async () => {
    mockCreateEvent.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Sunday long run');
    await user.type(screen.getByTestId(copy.eventDescription), 'Meet by the river');
    await user.type(screen.getByTestId(copy.eventLocation), 'Riverside park');
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(copy.eventError, expect.any(Error)));
  });

  it('uses the group sport without showing a redundant activity picker', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" groupSports={['run']} copy={copy} />);

    expect(screen.queryByText(copy.eventSport)).not.toBeOnTheScreen();
    expect(screen.queryByText(GROUP_SPORT_LABELS.run.en)).not.toBeOnTheScreen();
  });

  it('uses the first group sport for an event when the group supports multiple sports', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" groupSports={['walk', 'run']} copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Park walk');
    await user.type(screen.getByTestId(copy.eventDescription), 'A walk in the park');
    await user.type(screen.getByTestId(copy.eventLocation), 'Central park');
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({ sport: 'walk' })));
  });

  it('falls back to the supported sports when the group has none configured', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" groupSports={[]} copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Park run');
    await user.type(screen.getByTestId(copy.eventDescription), 'A run in the park');
    await user.type(screen.getByTestId(copy.eventLocation), 'Central park');
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() => expect(mockCreateEvent).toHaveBeenCalledWith(expect.objectContaining({ sport: 'run' })));
  });

  it('requires a meaningful title before submitting', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    await userEvent.press(screen.getByTestId('group-event-submit'));

    expect(mockErrorToast).toHaveBeenCalledWith(copy.eventTitleInvalid);
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it('rejects a date that has passed since the form opened', async () => {
    const now = Date.now();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(now);
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    nowSpy.mockReturnValue(now + 2 * 86400000);

    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Park run');
    await user.type(screen.getByTestId(copy.eventDescription), 'A run in the park');
    await user.type(screen.getByTestId(copy.eventLocation), 'Central park');
    await user.press(screen.getByTestId('group-event-submit'));
    nowSpy.mockRestore();

    expect(mockErrorToast).toHaveBeenCalledWith(copy.eventDateInvalid);
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it('rejects distances outside the supported range', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Park run');
    await user.type(screen.getByTestId(copy.eventDescription), 'A run in the park');
    await user.type(screen.getByTestId(copy.eventLocation), 'Central park');
    await user.type(screen.getByTestId('group-event-distance-input'), '501');
    await user.press(screen.getByTestId('group-event-submit'));

    expect(mockErrorToast).toHaveBeenCalledWith(copy.eventDistanceInvalid);
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  it('selects a date and time before publishing an event', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    const onCreated = jest.fn();
    const selectedDate = new Date(Date.now() + 3 * 86400000);
    const startsAt = new Date(selectedDate);
    startsAt.setHours(10, 30, 0, 0);
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} onCreated={onCreated} />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('group-event-date-input'));
    await user.press(screen.getByTestId('group-event-date-confirm'));
    await user.press(screen.getByTestId('group-event-time-confirm'));
    await user.type(screen.getByTestId('group-event-title-input'), 'Park run');
    await user.type(screen.getByTestId('group-event-distance-input'), '4,5');
    await user.type(screen.getByTestId(copy.eventDescription), '  Meet by the river  ');
    await user.type(screen.getByTestId(copy.eventLocation), '  Riverside park  ');
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() =>
      expect(mockCreateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: 'group-1',
          title: 'Park run',
          sport: 'run',
          distanceKm: 4.5,
          description: 'Meet by the river',
          locationName: 'Riverside park',
          startsAt: startsAt.toISOString(),
        }),
      ),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('keeps date selection open when no date is selected and can dismiss the picker', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('group-event-date-input'));
    await user.press(screen.getByTestId('group-event-date-empty'));

    expect(screen.getByTestId('group-event-date-confirm')).toBeOnTheScreen();
    await user.press(screen.getByTestId('group-event-date-dismiss'));

    expect(screen.queryByTestId('group-event-date-confirm')).not.toBeOnTheScreen();
  });

  it('uses Russian labels in the date and time pickers', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={GROUPS_COPY[LANGUAGES.russian]} />);
    const user = userEvent.setup();
    await user.press(screen.getByTestId('group-event-date-input'));
    await user.press(screen.getByTestId('group-event-date-confirm'));

    expect(screen.getByTestId('group-event-time-confirm')).toBeOnTheScreen();
  });
});
