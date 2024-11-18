import { IAuthConfig, IUser } from 'src/types';

export interface JWTPayload extends IUser {
  exp: number;
}

export interface AuthState {
  data: IAuthConfig | undefined;
  user: IUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  accessToken: string | undefined;
}

export interface AuthActions {
  logout: (reload?: boolean) => Promise<void>;
  setAccessToken: (token: string | null | undefined) => void;
}

export type IUseAuth = AuthState & AuthActions;
