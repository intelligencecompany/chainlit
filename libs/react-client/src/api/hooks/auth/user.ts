import { IUser } from 'src/types';

export const useUserManagement = (apiClient: any) => {
  const { setUser } = useUserState();

  const fetchUserData = async (): Promise<IUser | null> => {
    try {
      const response = await apiClient.getCurrentUser();
      return response.user || null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    const userData = await fetchUserData();
    setUser(userData);
  };

  return {
    fetchUserData,
    refreshUserData
  };
};
