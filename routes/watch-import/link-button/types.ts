export interface LinkButtonProps {
  label: string;
  onOpen: (url: string) => void;
  standalone?: boolean;
  url: string;
}
