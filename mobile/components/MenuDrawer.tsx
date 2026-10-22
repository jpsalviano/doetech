import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Button, ButtonText, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import Constants from 'expo-constants';
import { AuthContext } from '../contexts/AuthContext';
import { useComponentColors } from '../hooks/useComponentColors';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MenuDrawer({ isOpen, onClose, children }: MenuDrawerProps) {
  const { colors } = useComponentColors();
  const auth = useContext(AuthContext);
  const router = useRouter();

  // Pegar a versão do app.json
  const appVersion = Constants.expoConfig?.version 
    || Constants.manifest2?.extra?.expoClient?.version
    || Constants.manifest?.version
    || 'desconhecida';

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
      onClose();
      router.replace('/auth/login');
    }
  };

  const DrawerContent = () => (
    <View
      style={[
        styles.drawerContainer,
        { backgroundColor: colors.headerBackground },
      ]}
    >
      <VStack style={styles.drawerContent}>
        <Heading
          style={[
            styles.drawerTitle,
            { color: colors.headerText },
          ]}
        >
          Menu
        </Heading>

        <Button
          onPress={() => {
            onClose();
            router.push('/home');
          }}
          style={[
            styles.logoutButton,
            { backgroundColor: colors.headerBackground },
          ]}
        >
          <MaterialIcons
            name="home"
            size={20}
            color={colors.headerText}
            style={styles.logoutIcon}
          />
          <ButtonText style={{ color: colors.headerText }}>
            Home
          </ButtonText>
        </Button>

        <Button
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: colors.headerBackground },
          ]}
        >
          <MaterialIcons
            name="logout"
            size={20}
            color={colors.headerText}
            style={styles.logoutIcon}
          />
          <ButtonText style={{ color: colors.headerText }}>
            Sair
          </ButtonText>
        </Button>
      </VStack>

      {/* Versão do app no final */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Versão {appVersion}
        </Text>
      </View>
    </View>
  );

  return (
    <Drawer
      open={isOpen}
      onOpen={() => {}}
      onClose={onClose}
      drawerType="front"
      renderDrawerContent={DrawerContent}
      drawerStyle={{ backgroundColor: colors.headerBackground }}
    >
      {children}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 20,
  },
  drawerContent: {
    flex: 1,
    gap: 24,
    paddingTop: 40,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutIcon: {
    marginRight: 12,
  },
  versionContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionText: {
    fontSize: 12,
    opacity: 0.7,
  },
});