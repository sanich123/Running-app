import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './reduce-month-metrics';

describe('reduce month metrics', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
