import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@chainlit/react-client';

import { useQuery } from 'hooks/query';

export default function AuthCallback() {
  const query = useQuery();
  const { user, cookieAuth, setAccessToken, setUserFromAPI } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthCallbackEffect');

    if (!cookieAuth) {
      // Legacy auth token from request query parameter
      const token = query.get('access_token');
      return setAccessToken(token);
    }

    // Assuming we're authenticated (because redirected here), use cookie to get and set user.
    setUserFromAPI();
  }, [query, cookieAuth]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  return null;
}
