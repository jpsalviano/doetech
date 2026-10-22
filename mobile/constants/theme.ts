/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1e1e1e',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    
    background: '#d7d7d7',
    backgroundApp: '#f5f5f5',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    
    tint: tintColorLight,
    primary: '#2563eb',
    primaryLight: '#e3f2fd',
    
    icon: '#687076',
    border: '#e2e8f0',
    placeholder: '#94a3b8',
    shadow: '#2f2f31',
    
    tabIconDefault: '#fff',
    tabIconSelected: '#fff',
    headerBackground: '#17375d',
    headerText: '#fff',
    navBackground: '#17375d',
    
    success: '#10b981',
    info: '#0369a1',
    infoBackground: '#e0f2fe',
    warning: '#f59e0b',
    error: '#ef4444',
    
    switchActive: '#2563eb',
    switchInactive: '#cbd5e1',
    
    fabBackground: '#94a3b8',
    textOnPrimary: '#ffffff',
  },
  dark: {
    text: '#e6eefc',
    textSecondary: '#94a3b8',
    textTertiary: '#cbd5e1',
    
    background: '#0f172a',
    backgroundApp: '#0f172a',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    
    tint: tintColorDark,
    primary: '#3b82f6',
    primaryLight: '#93c5fd',
    
    icon: '#64748b',
    border: '#475569',
    placeholder: '#64748b',
    shadow: '#000',
    
    tabIconDefault: '#fff',
    tabIconSelected: '#fff',
    headerBackground: '#17375d',
    headerText: '#fff',
    navBackground: '#17375d',
    
    success: '#34d399',
    info: '#7dd3fc',
    infoBackground: '#1e3a5f',
    warning: '#fbbf24',
    error: '#f87171',
    
    switchActive: '#3b82f6',
    switchInactive: '#475569',
    
    fabBackground: '#ffffff',
    textOnPrimary: '#ffffff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'Poppins',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Poppins',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
