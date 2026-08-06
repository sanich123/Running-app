import { expectComponentModule } from '@T/utils/component-contract';
import * as componentModule from './display-activity-map';

describe('display activity map', () => {
  it('exports a component', () => expectComponentModule(componentModule));
});
