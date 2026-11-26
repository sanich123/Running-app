import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '@R/typed-hooks';
import CustomTextInput from '@S/custom-text-input/custom-text-input';
import { GROUPS_COPY } from '../../const';
import type { GroupCreationTextFields } from '../types';
import type { GroupDetailsFieldsProps } from './types';

export default function GroupDetailsFields({ details, onChange }: GroupDetailsFieldsProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { groupName, nameRequired, description: descriptionCopy, location } = GROUPS_COPY[language];
  const { name, description, locationName } = details;
  const { control } = useForm<GroupCreationTextFields>({
    defaultValues: { name, description, locationName },
  });

  return (
    <View style={styles.section}>
      <CustomTextInput<GroupCreationTextFields>
        control={control}
        fieldName="name"
        label={groupName}
        callback={(name) => onChange({ ...details, name })}
        maxLength={80}
        testID="group-name-input"
        validation={{ required: nameRequired }}
      />
      <CustomTextInput<GroupCreationTextFields>
        control={control}
        fieldName="description"
        label={descriptionCopy}
        callback={(description) => onChange({ ...details, description })}
        maxLength={2000}
        multiline
        numberOfLines={4}
        testID="group-description-input"
        validation={{ required: '' }}
      />
      <CustomTextInput<GroupCreationTextFields>
        control={control}
        fieldName="locationName"
        label={location}
        callback={(locationName) => onChange({ ...details, locationName })}
        maxLength={160}
        testID="group-location-input"
        validation={{ required: '' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
});
