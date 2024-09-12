import InfiniteScrollList from '@C/infinite-scroll-list/infinite-scroll-list';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActivitiesList() {
  const { ids } = useLocalSearchParams();
  console.log(ids)
  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, justifyContent: 'center' }}>
      {/* <InfiniteScrollList
        dataToRender={data?.activities}
        page={page}
        setPage={setPage}
        refetch={refetch}
        isLastPage={data?.isLastPage}
      /> */}
    </SafeAreaView>
  );
}
