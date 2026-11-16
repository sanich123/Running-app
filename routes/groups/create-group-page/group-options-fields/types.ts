import type { GroupCreationOptions } from '../types';

export interface GroupOptionsFieldsProps {
  options: GroupCreationOptions;
  onChange: (options: GroupCreationOptions) => void;
}
