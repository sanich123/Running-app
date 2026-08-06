import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './save-activity-page';

describe('save activity page', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
