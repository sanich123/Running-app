import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface HomeFeedErrorProps {
  error: FetchBaseQueryError | SerializedError;
  refetch: () => void | Promise<unknown>;
}
