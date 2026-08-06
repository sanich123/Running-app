import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './material-top-tabs-layout';

describe('material top tabs layout', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
