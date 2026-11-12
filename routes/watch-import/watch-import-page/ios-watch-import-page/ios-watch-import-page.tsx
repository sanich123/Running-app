import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { IOS_WATCH_IMPORT_COPY } from '../../const';
import ExpandableStep from '../../expandable-step/expandable-step';
import { renderAppleHealthLinks } from '../../utils';
import WorkoutImportContent from '../../workout-import-content/workout-import-content';

export default function IOSWatchImportPage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { title, intro, sourceApp, runich, compare, compareTitle } =
    IOS_WATCH_IMPORT_COPY[language === LANGUAGES.russian ? 'ru' : 'en'];

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
        {renderAppleHealthLinks(intro, colors.primary)}
      </Text>
      <ExpandableStep number={1} title={sourceApp.title}>
        <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
          {renderAppleHealthLinks(sourceApp.description, colors.primary)}
        </Text>
      </ExpandableStep>
      <ExpandableStep number={2} title={runich.title}>
        <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
          {renderAppleHealthLinks(runich.description, colors.primary)}
        </Text>
      </ExpandableStep>
      <WorkoutImportContent autoSync showIntro={false} />
      <ExpandableStep number={3} title={compareTitle} keepMounted>
        <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
          {renderAppleHealthLinks(compare, colors.primary)}
        </Text>
      </ExpandableStep>
    </>
  );
}

const styles = StyleSheet.create({
  bodyText: { lineHeight: 22 },
});
