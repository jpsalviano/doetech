import { getCommonFormStyles, getFormColors } from "../constants/formStyles";
import { useColorScheme } from "./use-color-scheme";
import { useThemeColor } from "./use-theme-color";

export function useComponentColors() {
  const colorScheme = useColorScheme() ?? 'light';
  const formColors = getFormColors(colorScheme);
  const formStyles = getCommonFormStyles(formColors);
  
  return {
    colorScheme,
    colors: {
      background: useThemeColor({}, 'surface'),
      backgroundApp: useThemeColor({}, 'backgroundApp'),
      backgroundSecondary: useThemeColor({}, 'surfaceSecondary'),
      text: useThemeColor({}, 'text'),
      textSecondary: useThemeColor({}, 'textSecondary'),
      textTertiary: useThemeColor({}, 'textTertiary'),
      border: useThemeColor({}, 'border'),
      
      primary: useThemeColor({}, 'primary'),
      primaryLight: useThemeColor({}, 'primaryLight'),
      success: useThemeColor({}, 'success'),
      error: useThemeColor({}, 'error'),
      warning: useThemeColor({}, 'warning'),
      info: useThemeColor({}, 'info'),
      
      cardBackground: useThemeColor({}, 'surface'),
      surface: useThemeColor({}, 'surface'),
      surfaceVariant: useThemeColor({}, 'surfaceSecondary'),
      inputBackground: useThemeColor({}, 'surfaceSecondary'),
      placeholder: useThemeColor({}, 'placeholder'),
      icon: useThemeColor({}, 'icon'),
      shadow: useThemeColor({}, 'shadow'),
      inactive: useThemeColor({}, 'border'),
      progressBackground: useThemeColor({}, 'surfaceSecondary'),
      
      headerBackground: useThemeColor({}, 'headerBackground'),
      headerText: useThemeColor({}, 'headerText'),
      navBackground: useThemeColor({}, 'navBackground'),
      tabIconDefault: useThemeColor({}, 'tabIconDefault'),
      tabIconSelected: useThemeColor({}, 'tabIconSelected'),
      
      switchActive: useThemeColor({}, 'switchActive'),
      switchInactive: useThemeColor({}, 'switchInactive'),
      
      infoBackground: useThemeColor({}, 'infoBackground'),
      infoBorder: useThemeColor({}, 'primaryLight'),
      infoText: useThemeColor({}, 'primary'),
      errorBackground: colorScheme === 'dark' ? '#7f1d1d' : '#fee2e2',
      errorBorder: useThemeColor({}, 'error'),
      
      fabBackground: useThemeColor({}, 'fabBackground'),
      textOnPrimary: useThemeColor({}, 'textOnPrimary'),
    },
    
    formColors,
    formStyles,
  };
}
