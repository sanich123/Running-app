import { Linking } from 'react-native';
import { errorToast } from '@S/error-toast/error-toast';

export async function openExternalLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    errorToast('', error);
  }
}
