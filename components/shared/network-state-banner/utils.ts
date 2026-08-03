import { isAirplaneModeEnabledAsync } from 'expo-network';
import ExpoVpnChecker from 'expo-vpn-checker';
import { errorToast } from '../error-toast/error-toast';

export async function checkVpn(setIsVpnEnabled: (arg: boolean) => void) {
  try {
    const result = ExpoVpnChecker.checkVpn();
    setIsVpnEnabled(result);
  } catch (error) {
    errorToast('При получении информации о впн произошла ошибка', error);
  }
}

export async function checkAirplaneMode(setIsAirplaneMode: (arg: boolean) => void) {
  try {
    const isAirPlaneMode = await isAirplaneModeEnabledAsync();
    setIsAirplaneMode(isAirPlaneMode);
  } catch (error) {
    errorToast('При получении информации о режиме полета', error);
  }
}
