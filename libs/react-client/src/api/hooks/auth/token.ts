import jwt_decode from 'jwt-decode';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ChainlitContext } from 'src/context';
import { accessTokenState, userState } from 'src/state';
import { setToken } from 'src/utils/token';

import { useSessionManagement } from './session';
import { JWTPayload } from './types';

export const useTokenManagement = () => {
  const [, setUser] = useRecoilState(userState);
  const [, setAccessToken] = useRecoilState(accessTokenState);

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
