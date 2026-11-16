import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ErrorComponentProps {
  error: FetchBaseQueryError | SerializedError;
  refetch?: () => object;
}
