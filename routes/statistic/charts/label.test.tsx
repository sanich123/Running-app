import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './label';

describe('label', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
