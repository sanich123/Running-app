import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './icons';

describe('icons', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
