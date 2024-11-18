import { useContext, useEffect } from 'react';
import { ChainlitContext } from 'src/context';
import { getToken } from 'src/utils/token';

import { useAuthConfig } from './config';
import { useSessionManagement } from './session';
import { useUserState } from './state';
import { useTokenManagement } from './token';
import { IUseAuth } from './types';

// Define useAuth hook
export const useAuth = (): IUseAuth => {
  const apiClient = useContext(ChainlitContext);

  const { authConfig, isLoading } = useAuthConfig();
  const { logout } = useSessionManagement(apiClient);
  const { user, accessToken } = useUserState();

  const { handleSetAccessToken } = useTokenManagement();

  const isReady = !!(!isLoading && authConfig);

  useEffect(() => {
    if (authConfig?.cookieAuth) {
      // TODO: Do something to get user object.
      // setUser(user as IUser)
      return;
    }

    if (!!user && (accessToken = getToken())) {
      // Initialize the token from local storage
      handleSetAccessToken(accessToken);
      return;
    }
  }, []);

  if (!authConfig?.requireLogin) {
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
    user,
    isReady,
    isAuthenticated: !!user,
    accessToken,
    logout,
    setAccessToken: saveAndSetToken
  };
};

// Re-export types and main hook
export type { IUseAuth };
