import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './year-month-title';

describe('year month title', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
