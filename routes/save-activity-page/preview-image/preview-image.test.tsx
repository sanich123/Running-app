import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './preview-image';

describe('preview image', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
