export type YearsAndTypes = {
  year: string;
  types: string[];
};

export type YearsAndTypesPickerProps = {
  setSelectedYear: (arg: number) => void;
  setSelectedType: (arg: string) => void;
  selectedYear: number;
  selectedType: string;
};
