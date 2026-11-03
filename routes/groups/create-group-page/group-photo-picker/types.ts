export interface GroupPhotoPickerProps {
  onPhotoAssetChange: (assetId: string | null) => void;
  onUploadingChange: (isUploading: boolean) => void;
  initialPhotoUrl?: string | null;
  uploadErrorMessage?: string;
}
