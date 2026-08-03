import { Platform, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useAppSelector } from '@R/typed-hooks';
import { SEARCH_INPUT } from './const';
import type { SearchInputProps } from './const';

export default function SearchInput({ setSearch, setIsInitial, search }: SearchInputProps) {
  const { language } = useAppSelector(({ language }) => language);
  const { width } = useWindowDimensions();
  return (
    <TextInput
      mode="outlined"
      label={SEARCH_INPUT[language].label}
      right={<TextInput.Icon icon="text-search" onPress={() => setSearch(search)} disabled={!search} />}
      style={{
        width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
      }}
      onChangeText={(search) => {
        setSearch(search.toLowerCase());
        setIsInitial(false);
      }}
      value={search}
    />
  );
}
