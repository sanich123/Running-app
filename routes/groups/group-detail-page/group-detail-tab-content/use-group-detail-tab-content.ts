import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../const';
import { GROUP_DETAIL_TABS } from './const';
import type { GroupDetailTab } from '../types';

export default function useGroupDetailTabContent() {
  const { tab: rawTab } = useLocalSearchParams<{ tab?: string | string[] }>();
  const { language } = useAppSelector(({ settings }) => settings);
  const requestedTab = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const [selectedTab, setSelectedTab] = useState<GroupDetailTab>(requestedTab === 'events' ? 'events' : 'distance');
  const copy = GROUPS_COPY[language];
  const selectTab = (value: string) => {
    const selectedValue = GROUP_DETAIL_TABS.find(({ value: tabValue }) => tabValue === value)?.value;
    if (selectedValue) setSelectedTab(selectedValue);
  };

  return { copy, selectedTab, selectTab };
}
