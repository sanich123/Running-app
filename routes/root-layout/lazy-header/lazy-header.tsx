import { Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export default function LazyHeader({ component: Component }: { component: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
