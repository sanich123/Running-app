import type { Edges } from 'react-native-safe-area-context';

export function getCrossPlatformLayoutEdges(edges: Edges, platform: string): Edges {
  if (platform !== 'android') return edges;

  return Array.isArray(edges) ? edges.filter((edge) => edge !== 'bottom') : { ...edges, bottom: 'off' };
}
