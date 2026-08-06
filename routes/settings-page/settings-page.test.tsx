import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './settings-page';

describe('settings page', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
