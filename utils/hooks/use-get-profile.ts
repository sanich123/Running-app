import { useEffect, useState } from 'react';
import { supabase } from '../../auth/supabase/supabase-init';
import { useAppSelector } from '@R/typed-hooks';

export default function useGetProfileInfo(column: string = '') {
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setError] = useState({});
  const [profileInfo, setProfileInfo] = useState({});
  const { userId } = useAppSelector(({ auth }) => auth);
  useEffect(() => {
    async function getProfileInfo() {
      const { error, data } = await supabase.from('accounts').select(column).eq('user_id', userId);

      if (error) {
        setError(error);
        setIsLoading(false);
      } else {
        setProfileInfo(data);
        setIsLoading(false);
      }
    }

    getProfileInfo();
  }, [column, userId]);

  return { isLoading, profileError, profileInfo };
}
