import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './map-km-split';

describe('map km split', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
