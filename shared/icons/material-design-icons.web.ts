import { createIconSet } from '@react-native-vector-icons/common';
import glyphMap from './material-design-icons.web.glyphmap.json';

const MaterialDesignIcons = createIconSet(glyphMap, {
  postScriptName: 'MaterialDesignIcons',
  fontFileName: 'MaterialDesignIcons.ttf',
});

export { MaterialDesignIcons };
export default MaterialDesignIcons;
