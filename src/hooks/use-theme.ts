import { useColorScheme } from 'react-native';

import { palette } from '@/constants/design';

export function useTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { colors: palette[scheme], scheme, isDark: scheme === 'dark' };
}
