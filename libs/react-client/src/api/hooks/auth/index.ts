import jwt_decode from 'jwt-decode';
import { useContext, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { ChainlitContext } from 'src/context';
import { threadHistoryState } from 'src/state';
import { IUser } from 'src/types';
import { getToken, removeToken, setToken } from 'src/utils/token';

import { useAuthConfig } from './config';
import { useUserState } from './state';
import { IUseAuth } from './types';

// Define useAuth hook
export const useAuth = (): IUseAuth => {
  const apiClient = useContext(ChainlitContext);
  const setThreadHistory = useSetRecoilState(threadHistoryState);
  const { authConfig, isLoading } = useAuthConfig();

  const { user, setUser, accessToken, setAccessToken } = useUserState();

  const isReady = !!(!isLoading && authConfig);

  const logout = async (reload = false) => {
    await apiClient.logout();
    setUser(null);

    if (!authConfig?.cookieAuth) {
      removeToken();
      setAccessToken('');
    }

    setThreadHistory(undefined);
    if (reload) {
      window.location.reload();
    }
  };

  const saveAndSetToken = (token: string | null | undefined) => {
    if (!token) {
      // TODO: Determine whether we need this here.
      logout();
      return;
    }
    try {
      const { exp, ...User } = jwt_decode(token) as any;
      setToken(token);
      setAccessToken(`Bearer ${token}`);
      setUser(User as IUser);
    } catch (e) {
      console.error(
        'Invalid token, clearing token from local storage',
        'error:',
        e
      );
      logout();
    }
  };

  useEffect(() => {
    if (authConfig?.cookieAuth) {
      // TODO: Do something to get user object.
      // setUser(user as IUser)
      return;
    }

    if (!user && getToken()) {
      // Initialize the token from local storage
      saveAndSetToken(getToken());
      return;
    }
  }, []);

  // TODO: Change this based on whether our cookies are working.
  const isAuthenticated = !!accessToken;

  if (authConfig && !authConfig.requireLogin) {
    return {
      data: authConfig,
      user: null,
      isReady,
      isAuthenticated: true,
      accessToken: '',
      logout: () => Promise.resolve(),
      setAccessToken: () => {}
    };
  }

  return {
    data: authConfig,
    user: user,
    isAuthenticated,
    isReady,
    accessToken: accessToken,
    logout: logout,
    setAccessToken: saveAndSetToken
  };
};

// Re-export types and main hook
export type { IUseAuth };
