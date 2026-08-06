import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './share-activity-image';

describe('share activity image', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
