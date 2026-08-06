import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './map-nav-icon';

describe('map nav icon', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
