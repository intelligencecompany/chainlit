import { useContext, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { ChainlitContext } from 'src/context';
import { threadHistoryState } from 'src/state';
import { getToken, removeToken } from 'src/utils/token';

import { useAuthConfig } from './config';
import { useUserState } from './state';
import { useTokenManagement } from './token';
import { IUseAuth } from './types';

// Define useAuth hook
export const useAuth = (): IUseAuth => {
  const apiClient = useContext(ChainlitContext);
  const setThreadHistory = useSetRecoilState(threadHistoryState);
  const { authConfig, isLoading } = useAuthConfig();

  const { user, setUser, accessToken, setAccessToken } = useUserState();

  const { handleSetAccessToken } = useTokenManagement();

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

  useEffect(() => {
    if (authConfig?.cookieAuth) {
      // TODO: Do something to get user object.
      // setUser(user as IUser)
      return;
    }

    if (!user && getToken()) {
      // Initialize the token from local storage
      handleSetAccessToken(getToken());
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
