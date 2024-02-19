import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from '../supabase-init';

export const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    console.log(errorCode)
    throw new Error(errorCode);
  }
  const { access_token, refresh_token } = params;
  if (!access_token) {
    console.log('нет токена')
    return;
  }
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) {
    console.log(error.message)
    throw error;
  }
  console.log('Успешно авторизовались')
  return data.session;
};
