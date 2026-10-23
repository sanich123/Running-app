import { Suspense } from 'react';
import { LANGUAGES } from '@const/enums';
import { LazyLegalDocumentPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function AccountDeletionEnglishScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLegalDocumentPage documentId="accountDeletion" language={LANGUAGES.english} />
    </Suspense>
  );
}
