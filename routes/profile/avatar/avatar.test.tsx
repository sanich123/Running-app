import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './avatar';

describe('avatar', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
