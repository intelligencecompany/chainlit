import { useSetRecoilState } from 'recoil';
import { threadHistoryState } from 'src/state';
import { removeToken } from 'src/utils/token';

import { useAuthConfig } from './config';
import { useUserState } from './state';

export const useSessionManagement = (apiClient: any) => {
  const { setUser, setAccessToken } = useUserState();
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
