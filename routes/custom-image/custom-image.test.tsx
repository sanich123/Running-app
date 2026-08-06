import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './custom-image';

describe('custom image', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
