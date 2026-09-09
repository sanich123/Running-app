import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Skeleton from '@S/skeleton/skeleton';

const SKELETON_ROWS = [0, 1, 2];

export default function CommentsSkeleton() {
  const { colors } = useTheme();

  return (
    <View testID="comments-skeleton" style={[styles.container, { backgroundColor: colors.surface }]}>
      {SKELETON_ROWS.map((row) => (
        <View key={row} style={[styles.row, { borderBottomColor: colors.outlineVariant }]}>
          <Skeleton style={styles.avatar} />
          <View style={styles.commentContent}>
            <Skeleton style={styles.name} />
            <Skeleton style={styles.date} />
            <Skeleton style={styles.comment} />
            <View style={styles.likes}>
              <Skeleton style={styles.likeIcon} />
              <Skeleton style={styles.likeCount} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    height: 16,
    width: 132,
  },
  date: {
    height: 12,
    marginTop: 4,
    width: 168,
  },
  comment: {
    height: 20,
    marginTop: 18,
    width: '86%',
  },
  likes: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },
  likeIcon: {
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  likeCount: {
    height: 14,
    marginLeft: 8,
    width: 58,
  },
});
