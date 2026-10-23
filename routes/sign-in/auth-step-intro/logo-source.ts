import { Platform, type ImageSourcePropType } from 'react-native';

const authStepIntroLogo: ImageSourcePropType =
  Platform.OS === 'web' ? require('../../../assets/images/icon-web.webp') : require('../../../assets/images/icon.png');

export default authStepIntroLogo;
