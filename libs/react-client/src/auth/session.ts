import { useRecoilState } from 'recoil';
import { useSetRecoilState } from 'recoil';
import { accessTokenState, threadHistoryState, userState } from 'src/state';
import { removeToken } from 'src/utils/token';

import { useAuthConfig } from './config';

export const useSessionManagement = (apiClient: any) => {
  const [, setUser] = useRecoilState(userState);
  const [, setAccessToken] = useRecoilState(accessTokenState);

  const { authConfig } = useAuthConfig();
  const setThreadHistory = useSetRecoilState(threadHistoryState);

  const logout = async (reload = false): Promise<void> => {
    await apiClient.logout();
    setUser(null);
    setThreadHistory(undefined);

    if (!authConfig?.cookieAuth) {
      removeToken();
      setAccessToken('');
    }

    if (reload) {
      window.location.reload();
    }
  };

  return {
    logout
  };
};
