import { StyleSheet } from 'react-native';
import { Colors } from './theme';

export const getFormColors = (colorScheme: 'light' | 'dark') => {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  return {
    cardBackground: theme.surface,
    inputBackground: theme.surfaceSecondary,
    messageBackground: theme.infoBackground,
    primary: theme.text,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
    messageText: theme.info,
    placeholder: theme.placeholder,
    inputBorder: theme.border,
    buttonBackground: theme.primary,
    buttonText: '#ffffff',
    switchActive: theme.switchActive,
    switchInactive: theme.switchInactive,
    shadowColor: theme.shadow,
    imagePlaceholder: theme.border,
    iconColor: theme.icon,
  };
};

export const getCommonFormStyles = (colors: ReturnType<typeof getFormColors>) => StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  form: {
    gap: 14,
    padding: 20,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    minHeight: 48,
  },
  inputField: {
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    lineHeight: 20,
    color: colors.primary,
  },
  inputSelect: {
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.secondary,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.tertiary,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: colors.buttonBackground,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});
