import jwt_decode from 'jwt-decode';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { ChainlitContext } from 'src/context';
import { accessTokenState, userState } from 'src/state';

import { useSessionManagement } from './session';
import { JWTPayload } from './types';

const tokenKey = 'token';

export function getToken(): string | null | undefined {
  try {
    return localStorage.getItem(tokenKey);
  } catch (e) {
    return;
  }
}

export function setToken(token: string): void {
  try {
    return localStorage.setItem(tokenKey, token);
  } catch (e) {
    return;
  }
}

export function removeToken(): void {
  try {
    return localStorage.removeItem(tokenKey);
  } catch (e) {
    return;
  }
}

export function ensureTokenPrefix(token: string): string {
  const prefix = 'Bearer ';
  if (token.startsWith(prefix)) {
    return token;
  } else {
    return prefix + token;
  }
}

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
