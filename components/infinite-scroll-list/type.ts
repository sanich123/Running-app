export type InfiniteScrollListProps = {
  dataToRender: any;
  setPage?: (arg: number) => void;
  page: number;
  refetch: () => void;
};
