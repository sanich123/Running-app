interface DateFilterOption {
  label: string;
  value: number | null;
}

export interface DateFilterMenuProps {
  triggerLabel: string;
  accessibilityLabel: string;
  testID: string;
  options: DateFilterOption[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
}
