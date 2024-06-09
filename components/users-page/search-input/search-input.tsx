import { useAppSelector } from '@R/typed-hooks';
import { TextInput } from 'react-native-paper';

import { SEARCH_INPUT, SearchInputProps } from './const';

export default function SearchInput({ setSearch, setIsInitial, search }: SearchInputProps) {
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TextInput
      mode="outlined"
      label={SEARCH_INPUT[language].label}
      right={<TextInput.Icon icon="text-search" onPress={() => setSearch(search)} disabled={!search} />}
      style={{ marginLeft: 10, marginRight: 10 }}
      onChangeText={(search) => {
        setSearch(search);
        setIsInitial(false);
      }}
      value={search}
    />
  );
}
