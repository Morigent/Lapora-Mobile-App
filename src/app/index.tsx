import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const profile = useAuthStore((state) => state.profile);
  return <Redirect href={profile ? '/(tabs)/home' : '/(auth)/login'} />;
}
