import { useContext, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { ChainlitContext } from 'src/context';
import { userState } from 'src/state';

import { useAuthConfig } from './config';
import { getToken, useTokenManagement } from './token';

export const useUser = () => {
  const apiClient = useContext(ChainlitContext);
  const [user, setUser] = useRecoilState(userState);
  const { cookieAuth } = useAuthConfig();
  const { handleSetAccessToken } = useTokenManagement();

  // Legacy token auth; initialize the token from local storage
  const setUserFromLocalStore = () => {
    {
      const storedAccessToken = getToken();
      if (storedAccessToken) handleSetAccessToken(storedAccessToken);
    }
  };

  // Cookie-based auth; use API to set user.
  const setUserFromAPI = async () => {
    // Get user from cookie, return true when succesful
    try {
      const apiUser = await apiClient.getUser();
      if (apiUser) {
        setUser(apiUser);
      }
    } catch (e) {
      return;
    }
  };

  const initUser = () => {
    // Already logged in
    if (user) return;

    // Legacy fallback
    if (!cookieAuth) return setUserFromLocalStore();

    // Request user from API
    setUserFromAPI();
  };

  // Attempt to initialise user on app start.
  useEffect(initUser, [cookieAuth]);

  return {
    user,
    setUserFromAPI
  };
};
