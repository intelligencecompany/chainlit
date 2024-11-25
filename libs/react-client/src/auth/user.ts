import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from 'src/state';

import { IUser, useApi } from '..';
import { useAuthConfig } from './config';
import { getToken, useTokenManagement } from './token';

export const useUser = () => {
  console.log('useUser');

  const [user, setUser] = useRecoilState(userState);
  const { cookieAuth } = useAuthConfig();
  const { handleSetAccessToken } = useTokenManagement();

  const { data: userData, mutate: mutateUserData } = useApi<IUser>('/user', {
    revalidateOnMount: false
  });

  // Attempt to get user when cookieAuth are available.
  useEffect(() => {
    if (!user) {
      if (cookieAuth) {
        console.log('cookieAuth', user, cookieAuth);
        mutateUserData();
        return;
      }

      // Not using cookie auth, callback to header tokens
      console.log('tokenAuth', user, cookieAuth);
      const token = getToken();
      if (token) handleSetAccessToken(token);
    }
  }, [user, cookieAuth]);

  // When user data is available, set the user object.
  useEffect(() => {
    console.log('userData effect');

    if (userData) {
      console.log('setUser', userData);
      setUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    console.log('useUser effect');
  });

  return {
    user,
    setUserFromAPI: mutateUserData
  };
};
