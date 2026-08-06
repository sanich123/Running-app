import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './map-route-line';

describe('map route line', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
