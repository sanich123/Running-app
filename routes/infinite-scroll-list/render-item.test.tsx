import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './render-item';

describe('render item', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
