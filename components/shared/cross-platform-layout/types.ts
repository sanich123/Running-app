import { Edges } from 'react-native-safe-area-context';

export interface CrossPlatformLayoutProps {
  isError?: boolean;
  isLoading?: boolean;
  refetch?: () => void;
  scrollViewEnabled?: boolean;
  outerStyles?: object;
  edges?: Edges;
}
