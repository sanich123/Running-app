import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './activity';

describe('activity', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
