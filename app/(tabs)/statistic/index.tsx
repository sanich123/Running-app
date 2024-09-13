import { ScrollView, View } from 'react-native';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { useState } from 'react';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import Charts from '@C/statistic/charts/charts';
import { useTheme } from 'react-native-paper';

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>(SPORTS_BTNS_VALUES.run);
  const { colors } = useTheme();
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ backgroundColor: colors.background }}>
        <YearTypePicker
          setSelectedYear={setSelectedYear}
          setSelectedType={setSelectedType}
          selectedYear={selectedYear}
          selectedType={selectedType}
        />
        <Charts year={selectedYear} type={selectedType} />
      </View>
    </ScrollView>
  );
}
