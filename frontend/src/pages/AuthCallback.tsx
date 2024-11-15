import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@chainlit/react-client';

import { useQuery } from 'hooks/query';

export default function AuthCallback() {
  const query = useQuery();
  const { authConfig, user, setAccessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authConfig && !authConfig.cookieAuth) {
      // Legacy token auth
      const token = query.get('access_token');
      setAccessToken(token);
    } else {
      // TODO: Do stuff to ensure user object.
    }
  }, [query]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  return null;
}
