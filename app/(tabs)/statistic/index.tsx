import { ScrollView, View } from 'react-native';
import YearTypePicker from '@C/statistic/year-type-picker/year-type-picker';
import { useState } from 'react';
import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';
import Charts from '@C/statistic/charts/charts';

export default function Statistics() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string>(SPORTS_BTNS_VALUES.run);
  console.log(selectedYear, selectedType);
  return (
    <ScrollView style={{ flex: 1 }}>
      <YearTypePicker
        setSelectedYear={setSelectedYear}
        setSelectedType={setSelectedType}
        selectedYear={selectedYear}
        selectedType={selectedType}
      />
      <Charts year={selectedYear} type={selectedType} />
    </ScrollView>
  );
}
