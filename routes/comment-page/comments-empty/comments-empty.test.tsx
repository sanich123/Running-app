import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './comments-empty';

describe('comments empty', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
