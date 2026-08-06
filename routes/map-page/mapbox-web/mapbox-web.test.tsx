import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './mapbox-web';

describe('mapbox web', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
