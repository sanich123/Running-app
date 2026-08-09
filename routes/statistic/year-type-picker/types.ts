export interface YearsAndTypes {
  year: string;
  types: string[];
}

export interface YearsAndTypesPickerProps {
  setSelectedYear: (arg: number) => void;
  setSelectedType: (arg: string) => void;
  selectedYear: number;
  selectedType: string;
  availableYearsAndTypes: YearsAndTypes[];
}
