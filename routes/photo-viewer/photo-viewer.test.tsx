import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './photo-viewer';

describe('photo viewer', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
