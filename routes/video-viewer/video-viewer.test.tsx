import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './video-viewer';

describe('video viewer', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
