import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './calendar-date-empty';

describe('calendar date empty', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
