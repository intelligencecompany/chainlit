import jwt_decode from 'jwt-decode';
import { useContext } from 'react';
import { ChainlitContext } from 'src/context';
import { setToken } from 'src/utils/token';

import { useSessionManagement } from './session';
import { useUserState } from './state';
import { JWTPayload } from './types';

export const useTokenManagement = () => {
  const { setUser, setAccessToken } = useUserState();
  const { logout } = useSessionManagement(useContext(ChainlitContext));

  const processToken = (token: string): void => {
    try {
      const { exp, ...userInfo } = jwt_decode<JWTPayload>(token);
      setToken(token);
      setAccessToken(`Bearer ${token}`);
      setUser(userInfo);
    } catch (error) {
      console.error('Invalid token:', error);
      throw new Error('Invalid token format');
    }
  };

  const handleSetAccessToken = (token: string | null | undefined): void => {
    if (!token) {
      logout();
      return;
    }

    try {
      processToken(token);
    } catch {
      logout();
    }
  };

  return {
    handleSetAccessToken
  };
};
