import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '@R/typed-hooks';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { GROUPS_COPY } from '../../const';
import type { GroupCreationDetails, GroupCreationTextFields } from '../types';

export default function GroupDetailsFields({
  details,
  onChange,
}: {
  details: GroupCreationDetails;
  onChange: (details: GroupCreationDetails) => void;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const { control } = useForm<GroupCreationTextFields>({
    defaultValues: { name: details.name, description: details.description, locationName: details.locationName },
  });

  return (
    <View style={styles.section}>
      <CustomTextInput<GroupCreationTextFields>
        control={control}
        fieldName="name"
        label={copy.groupName}
        callback={(name) => onChange({ ...details, name })}
        maxLength={80}
        testID="group-name-input"
        validation={{ required: copy.nameRequired }}
      />
      <CustomTextInput<GroupCreationTextFields>
        control={control}
        fieldName="description"
        label={copy.description}
        callback={(description) => onChange({ ...details, description })}
        maxLength={2000}
        multiline
        numberOfLines={4}
        testID="group-description-input"
        validation={{ required: '' }}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: details.isWorldwide }}
        testID="group-worldwide-toggle"
        onPress={() => onChange({ ...details, isWorldwide: !details.isWorldwide })}
        style={styles.worldwideOption}>
        <Icon
          source={details.isWorldwide ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={22}
          color={colors.primary}
        />
        <Text variant="bodyMedium">{copy.worldwide}</Text>
      </Pressable>
      {!details.isWorldwide && (
        <CustomTextInput<GroupCreationTextFields>
          control={control}
          fieldName="locationName"
          label={copy.location}
          callback={(locationName) => onChange({ ...details, locationName })}
          maxLength={160}
          testID="group-location-input"
          validation={{ required: '' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  worldwideOption: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingVertical: 4 },
});
