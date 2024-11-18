import jwt_decode from 'jwt-decode';
import { useContext, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ChainlitContext } from 'src/context';
import {
  accessTokenState,
  authState,
  threadHistoryState,
  userState
} from 'src/state';
import { IAuthConfig, IUser } from 'src/types';
import { getToken, removeToken, setToken } from 'src/utils/token';

import { useApi } from 'src/api/hooks/api';

import { IUseAuth } from './types';

// Define useAuth hook
export const useAuth = (): IUseAuth => {
  const apiClient = useContext(ChainlitContext);
  const [authConfig, setAuthConfig] = useRecoilState(authState);
  const [user, setUser] = useRecoilState(userState);
  const { data, isLoading } = useApi<IAuthConfig>(
    authConfig ? null : '/auth/config'
  );
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  const setThreadHistory = useSetRecoilState(threadHistoryState);

  useEffect(() => {
    if (!data) return;
    setAuthConfig(data);
  }, [data, setAuthConfig]);

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
