import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './charts';

describe('charts', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
