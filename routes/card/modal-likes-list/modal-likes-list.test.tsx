import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './modal-likes-list';

describe('modal likes list', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
