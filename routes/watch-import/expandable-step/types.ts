import type { ReactNode } from 'react';

export interface ExpandableStepProps {
  children: ReactNode;
  keepMounted?: boolean;
  number: number;
  title: string;
}
