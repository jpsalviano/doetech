import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "@gluestack-ui/themed";
import { Href, usePathname, useRouter } from "expo-router";
import React, { useContext, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useComponentColors } from "../hooks/useComponentColors";
import { AuthContext } from "@/contexts/AuthContext";

interface NavItem {
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

const navItems: NavItem[] = [
  {
    route: "/equipments" as Href,
    icon: "devices",
    label: "Equipamentos",
  },
  {
    route: "/donations" as Href,
    icon: "volunteer-activism",
    label: "Doações",
  },
  {
    route: "/profile" as Href,
    icon: "person",
    label: "Perfil",
  },
  {
    route: "/dashboards" as Href,
    icon: "person",
    label: "Dashboards",
  },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useComponentColors();
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.isAdmin ?? false;

  const getRouteString = (route: Href): string => {
    return typeof route === 'string' ? route : route.pathname || '';
  };

  const isActive = (route: Href): boolean => {
    return pathname === getRouteString(route);
  };

  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      const routeStr = getRouteString(item.route);
      
      if (routeStr === '/dashboards') {
        return isAdmin;
      }
      
      if (routeStr === '/profile') {
        return !isAdmin;
      }
      
      return true;
    });
  }, [isAdmin]);

  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.navBackground }]}>
      {filteredNavItems.map((item) => {
        const active = isActive(item.route);
        const iconColor = active
          ? colors.tabIconSelected
          : colors.tabIconDefault;

        return (
          <Pressable
            key={typeof item.route === 'string' ? item.route : item.route.pathname}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <MaterialIcons name={item.icon} size={24} color={iconColor} />
            <Text
              style={[
                styles.navText,
                {
                  color: iconColor,
                  fontFamily: 'Poppins',
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    padding: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});
