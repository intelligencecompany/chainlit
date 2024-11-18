import { useRecoilState } from 'recoil';
import { accessTokenState, userState } from 'src/state';

export const useUserState = () => {
  const [user, setUser] = useRecoilState(userState);
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);

  return {
    user,
    setUser,
    accessToken,
    setAccessToken
  };
};
