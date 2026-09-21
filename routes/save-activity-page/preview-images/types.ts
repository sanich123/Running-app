export interface PreviewImagesProps {
  images: { url: string; thumbnail: string | null }[];
  isDisabled: boolean;
  compact?: boolean;
  horizontal?: boolean;
  setImages: (arg: { url: string; thumbnail: string | null }[]) => void;
}
