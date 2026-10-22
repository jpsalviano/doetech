import { Box, Heading, Image, Spinner, Text, VStack } from "@gluestack-ui/themed";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useComponentColors } from "@/hooks/useComponentColors";
import { AuthContext } from "@/contexts/AuthContext";

export default function HomeScreen() {
  const { account, loading } = useUserProfile();
  const { colors } = useComponentColors();

  const displayName = account?.name || account?.businessName;
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.isAdmin ?? false;

  // Mostrar loader enquanto carrega
  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.backgroundApp }]}>
        <Spinner size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <Box style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <VStack gap="$4" alignItems="center">
        <Image
          source={require('../../assets/logo.svg')}
          style={{ width: 80, height: 80, marginBottom: 12 }}
          resizeMode="contain"
        />
        <Heading style={{ color: colors.text }}> {isAdmin ? "Painel do Administrador" : (displayName ? `Olá, ${displayName}!` : "Bem-vindo ao DoeTech! Faça login para continuar.")} 
        </Heading>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loaderText: {
    fontSize: 16,
    marginTop: 12,
  },
});