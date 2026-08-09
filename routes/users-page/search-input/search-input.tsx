import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { SEARCH_ICON_TEST_ID, SEARCH_INPUT, SEARCH_INPUT_TEST_ID } from './const';
import type { SearchInputProps } from './const';

export default function SearchInput({ setSearch, setIsInitial, search }: SearchInputProps) {
  const { language } = useAppSelector(({ language }) => language);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  return (
    <TextInput
      testID={SEARCH_INPUT_TEST_ID}
      mode="outlined"
      placeholder={SEARCH_INPUT[language].label}
      right={
        <TextInput.Icon
          testID={SEARCH_ICON_TEST_ID}
          icon="account-search-outline"
          onPress={() => setSearch(search)}
          disabled={!search}
        />
      }
      autoCapitalize="none"
      autoCorrect={false}
      inputMode="search"
      style={[
        styles.input,
        {
          backgroundColor: colors.surface,
          width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        },
      ]}
      contentStyle={styles.content}
      outlineColor={colors.outlineVariant}
      activeOutlineColor={colors.primary}
      textColor={colors.onSurface}
      outlineStyle={styles.outline}
      onChangeText={(search) => {
        setSearch(search.toLowerCase());
        setIsInitial(false);
      }}
      value={search}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    fontFamily: FONT_FAMILIES.regular,
    paddingBottom: 8,
    paddingTop: 2,
    textAlignVertical: 'center',
  },
  input: { fontSize: 15, minHeight: 52 },
  outline: { borderRadius: 8 },
});
