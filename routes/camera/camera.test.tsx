import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './camera';

describe('camera', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
