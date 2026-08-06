import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './comments-list-modal';

describe('comments list modal', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
