import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './intro';

describe('intro', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
