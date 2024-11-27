import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Logo } from 'components/atoms/logo';
import { Translator } from 'components/i18n';
import { AuthLogin } from 'components/molecules/auth';

import { useQuery } from 'hooks/query';

import { ChainlitContext, useAuth } from 'client-types/*';

export default function Login() {
  const query = useQuery();
  const {
    data: config,
    setAccessToken,
    user,
    cookieAuth,
    setUserFromAPI
  } = useAuth();
  const [error, setError] = useState('');
  const apiClient = useContext(ChainlitContext);

  const navigate = useNavigate();

  const handleHeaderAuth = async () => {
    try {
      const json = await apiClient.headerAuth();
      setAccessToken(json.access_token);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePasswordLogin = async (
    email: string,
    password: string,
    callbackUrl: string
  ) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const json = await apiClient.passwordAuth(formData);

      if (!cookieAuth) {
        // Handle case where access_token is in JSON reply.
        const access_token = json.access_token;
        if (access_token) setAccessToken(access_token);
      }

      if (json?.success != true)
        throw new Error('Error logging in. Please try again later.');

      // Validate login cookie and get user data.
      setUserFromAPI();

      navigate(callbackUrl);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    setError(query.get('error') || '');
  }, [query]);

  useEffect(() => {
    if (!config) {
      return;
    }
    if (!config.requireLogin) {
      navigate('/');
    }
    if (config.headerAuth) {
      handleHeaderAuth();
    }
    if (user) {
      navigate('/');
    }
  }, [config, user]);

  return (
    <AuthLogin
      title={<Translator path="components.molecules.auth.authLogin.title" />}
      error={error}
      callbackUrl="/"
      providers={config?.oauthProviders || []}
      onPasswordSignIn={config?.passwordAuth ? handlePasswordLogin : undefined}
      onOAuthSignIn={async (provider: string) => {
        window.location.href = apiClient.getOAuthEndpoint(provider);
      }}
      renderLogo={<Logo style={{ maxWidth: '60%', maxHeight: '90px' }} />}
    />
  );
}
