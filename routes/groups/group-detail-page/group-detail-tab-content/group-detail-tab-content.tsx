import { StyleSheet, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { GROUP_DETAIL_TABS } from './const';
import GroupDistanceList from './group-distance-list/group-distance-list';
import GroupEventsTab from './group-events-tab/group-events-tab';
import GroupMembersList from './group-members-list/group-members-list';
import GroupPostsList from './group-posts-list/group-posts-list';
import useGroupDetailTabContent from './use-group-detail-tab-content';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupDetailTabContent({
  group,
  isActiveMember,
}: {
  group: GroupDetails;
  isActiveMember: boolean;
}) {
  const { copy, selectedTab, selectTab } = useGroupDetailTabContent();

  return (
    <View style={styles.content}>
      <SegmentedButtons
        value={selectedTab}
        onValueChange={selectTab}
        buttons={GROUP_DETAIL_TABS.map(({ value, icon, copyKey }) => ({
          value,
          icon,
          accessibilityLabel: copy[copyKey],
          showSelectedCheck: false,
        }))}
      />
      {selectedTab === 'members' ? (
        <GroupMembersList group={group} isActiveMember={isActiveMember} />
      ) : selectedTab === 'distance' ? (
        <GroupDistanceList group={group} />
      ) : selectedTab === 'posts' ? (
        <GroupPostsList group={group} />
      ) : (
        <GroupEventsTab group={group} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ content: { flex: 1, gap: 12 } });
