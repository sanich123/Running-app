import { useEffect, useState } from 'react';

import { useAuth } from '../../auth/context/auth-context';
import { supabase } from '../../auth/supabase/supabase-init';

export default function useGetProfileInfo(column: string = '') {
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setError] = useState({});
  const [profileInfo, setProfileInfo] = useState({});
  const { user } = useAuth();
  useEffect(() => {
    async function getProfileInfo() {
      const { error, data } = await supabase
        .from('accounts')
        .select(column)
        .eq('user_id', user?.id);

      if (error) {
        setError(error);
        setIsLoading(false);
      } else {
        setProfileInfo(data);
        setIsLoading(false);
      }
    }

    getProfileInfo();
  }, []);

  return { isLoading, profileError, profileInfo };
}
