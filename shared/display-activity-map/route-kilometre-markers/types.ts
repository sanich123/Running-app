import type { ActivityKilometreSplit } from '@S/card/types';
export interface SelectedKilometre {
  coordinate: [number, number];
  number: number;
}

export interface RouteKilometreMarkersProps {
  kilometresSplit?: ActivityKilometreSplit[];
  kilometreUnit?: string;
}
