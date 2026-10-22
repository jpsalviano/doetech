import { GluestackUIProvider } from "@gluestack-ui/themed";
import { Slot, usePathname, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import MenuDrawer from "../components/MenuDrawer";
import { AuthContext, AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { HeaderProvider, useHeader } from "../contexts/HeaderContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import { config } from "../gluestack-ui.config";
import { useComponentColors } from "../hooks/useComponentColors";

function RootNavigator() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useComponentColors();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { title } = useHeader();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const publicRoutes = ["/auth/login", "/auth/login/", "/auth/register", "/auth/register/", "/auth/recover", "/auth/recover/"];
        if (!publicRoutes.includes(pathname)) {
          router.replace("/auth/login");
        }
      } else {
        if (pathname.startsWith("/auth")) {
          router.replace("/");
        }
      }
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAuthRoute = pathname.startsWith("/auth");

  if (isAuthRoute || !user) {
    return <Slot />;
  }

  return (
    <MenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Header title={title} onMenuPress={() => setIsDrawerOpen(true)} />

          {/* Main Content */}
          <View style={[styles.content, { backgroundColor: colors.background }]}>
            <Slot />
          </View>

          <BottomNav />
        </View>
      </SafeAreaView>
    </MenuDrawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <GluestackUIProvider config={config}>
          <HeaderProvider>
            <CartProvider>
              <RootNavigator />
            </CartProvider>
          </HeaderProvider>
        </GluestackUIProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}
