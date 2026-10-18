import type { PreviewImagesProps } from '../preview-images/types';
import type { ActivityPhoto } from '@R/slices/activity/types';
export type PreviewImageCloseBtnProps = PreviewImagesProps &
  (
    | { media: ActivityPhoto; image?: never; thumbnail?: never }
    | { media?: never; image: string; thumbnail?: string | null }
  );
