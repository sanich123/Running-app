import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './comment';

describe('comment', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
