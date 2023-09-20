import { Alert } from 'react-native';

import { errorHandler } from '../../../utils/error-handler';
import { supabase } from '../supabase-init';

type UserSettings = {
  user_id: string;
  gender: string;
  sport: string;
  name: string;
  surname: string;
  city: string;
  weight: string;
  bio: string;
  birthday: Date | null;
  profile_photo: string;
};
export async function checkIfProfileExist(userId: string) {
  try {
    const { error, data: profileAccount } = await supabase.from('accounts').select().eq('user_id', userId);
    if (error) {
      console.log(error);
      Alert.alert(error.message);
    }
    return profileAccount;
  } catch (error) {
    errorHandler(error);
  }
}

export async function insertUserProfile(userId: string, userSettings: UserSettings) {
  try {
    const { error } = await supabase.from('accounts').update(userSettings).eq('user_id', userId).select();
    if (error) {
      console.log(error);
      Alert.alert(error.message);
    }
  } catch (error) {
    errorHandler(error);
  }
}

export async function updateUserProfile(userId: string, userSettings: UserSettings) {
  try {
    const { error } = await supabase.from('accounts').update(userSettings).eq('user_id', userId).select();
    if (error) {
      console.log(error);
      Alert.alert(error.message);
    }
  } catch (error) {
    errorHandler(error);
  }
}
