import { LANGUAGES } from '@const/enums';
import { photosApi, type UploadedPhotoResponse } from '@R/services/photos/photos';
import { store } from '@R/store';
import { errorToast } from '@S/error-toast/error-toast';
import { FILE_SENDING_ERROR_COPY } from './const';
import type { MediaUploadControl } from './file-sending-types';

export async function waitForMediaUploadReview<T extends UploadedPhotoResponse>(
  uploads: T[],
  control?: MediaUploadControl,
): Promise<T[]> {
  const assetIds = uploads.flatMap(({ assetId, status, url }) =>
    assetId && !url && status && ['queued', 'processing'].includes(status) ? [assetId] : [],
  );
  if (!assetIds.length) return uploads;

  const results = new Map<string, T>();
  uploads.forEach((upload) => {
    if (upload.assetId) results.set(upload.assetId, upload);
  });
  let pendingIds = assetIds;
  let notifiedForReview = false;

  for (let attempt = 0; pendingIds.length && attempt < 180; attempt += 1) {
    if (control?.signal?.aborted) throw new Error('Загрузка медиафайлов отменена');
    const request = store.dispatch(
      photosApi.endpoints.getMediaUploadStatuses.initiate({ ids: pendingIds }, { forceRefetch: true }),
    );
    try {
      const response = await request.unwrap();
      response.items.forEach((status) => {
        const previous = results.get(status.assetId);
        if (!previous) return;
        results.set(status.assetId, { ...previous, ...status });
      });
      if (!notifiedForReview && response.items.some(({ status }) => status === 'review_required')) {
        notifiedForReview = true;
        const isRussian = store.getState().settings.language === LANGUAGES.russian;
        errorToast(
          isRussian
            ? FILE_SENDING_ERROR_COPY.videoModerationNotice.russian
            : FILE_SENDING_ERROR_COPY.videoModerationNotice.english,
        );
      }
      const approvedButUnpublished = response.items.filter(({ status, url }) => status === 'approved' && !url);
      await Promise.all(
        approvedButUnpublished.map(async ({ assetId }) => {
          const publish = store.dispatch(photosApi.endpoints.publishApprovedMediaUpload.initiate({ assetId }));
          try {
            const result = await publish.unwrap();
            const previous = results.get(assetId);
            if (previous) results.set(assetId, { ...previous, status: 'approved', ...result });
          } finally {
            publish.reset();
          }
        }),
      );
    } finally {
      request.unsubscribe();
    }

    pendingIds = pendingIds.filter((assetId) => {
      const status = results.get(assetId)?.status;
      return status === 'queued' || status === 'processing' || status === 'review_required';
    });
    if (pendingIds.some((assetId) => results.get(assetId)?.status === 'review_required')) {
      control?.onProgress?.(0.95);
    }
    if (pendingIds.length) await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  if (pendingIds.length) throw new Error('Проверка медиа занимает больше времени. Файл пока недоступен.');
  return uploads.map((upload) => (upload.assetId ? (results.get(upload.assetId) ?? upload) : upload));
}
