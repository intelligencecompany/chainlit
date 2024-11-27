import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from 'src/state';

import { IUser, useApi } from '..';
import { useAuthConfig } from './config';
import { getToken, useTokenManagement } from './token';

export const useUser = () => {
  console.log('useUser');

  const [user, setUser] = useRecoilState(userState);
  const { cookieAuth, isLoading: authConfigLoading } = useAuthConfig();
  const { handleSetAccessToken } = useTokenManagement();

  const { data: userData, mutate: mutateUserData } = useApi<IUser>(
    cookieAuth ? '/user' : null
  );

  // When user data is available, set the user object.
  useEffect(() => {
    console.log('userData effect');

    if (userData) {
      console.log('setUser', userData);
      setUser(userData);
    }
  }, [userData]);

  // Attempt to get user when cookieAuth are available.
  useEffect(() => {
    if (!(user && authConfigLoading && cookieAuth)) {
      // Not using cookie auth, attempt to get access token from local storage
      console.log('tokenAuth', user, cookieAuth);
      const token = getToken();
      if (token) handleSetAccessToken(token);
    }
  }, [user, cookieAuth]);

  return {
    user,
    setUserFromAPI: mutateUserData
  };
};
