import { Box, Text, Pressable } from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useComponentColors } from '@/hooks/useComponentColors';

interface DashboardCard {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  description: string;
}

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: '1',
    title: 'Equipamentos e solicitações',
    icon: 'bar-chart',
    route: '/dashboards/equipments-requests',
    description: 'Equipamentos anunciados e solicitados'
  },
  {
    id: '2',
    title: 'Beneficiários',
    icon: 'pie-chart',
    route: '/dashboards/beneficiaries',
    description: 'Beneficiários atendidos ao longo do tempo'
  },
  {
    id: '3',
    title: 'Tempo médio de doação',
    icon: 'analytics',
    route: '/dashboards/donation-time',
    description: 'Tempo médio dos processos de doação'
  },
  {
    id: '4',
    title: 'Processos de doação',
    icon: 'show-chart',
    route: '/dashboards/donation-processes',
    description: 'Processos de doação - DoeTech'
  },
  {
    id: '5',
    title: 'Percentual de Reutilização',
    icon: 'pie-chart',
    route: '/dashboards/reuse-percentage',
    description: 'Taxa de reutilização de equipamentos'
  },
];

export default function DashboardsHomeScreen() {
  useScreenTitle('Dashboards');
  const router = useRouter();
  const { colors } = useComponentColors();

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.backgroundApp }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Box style={styles.content}>
        {/* Grid de cards */}
        <View style={styles.cardsGrid}>
          {DASHBOARD_CARDS.map((card) => (
            <Pressable
              key={card.id}
              style={styles.cardWrapper}
              onPress={() => handleCardPress(card.route)}
            >
              <Box 
                style={[
                  styles.card, 
                  { 
                    backgroundColor: colors.surface,
                    shadowColor: colors.shadow
                  }
                ]}
              >
                {/* Contêiner do ícone */}
                <Box 
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colors.primaryLight }
                  ]}
                >
                  <MaterialIcons 
                    name={card.icon} 
                    size={40} 
                    color={colors.primary} 
                  />
                </Box>

                {/* Título do card */}
                <Text 
                  style={[
                    styles.cardTitle, 
                    { color: colors.text }
                  ]}
                  numberOfLines={2}
                >
                  {card.title}
                </Text>

                {/* Descrição do card */}
                <Text 
                  style={[
                    styles.cardDescription, 
                    { color: colors.textSecondary }
                  ]}
                  numberOfLines={3}
                >
                  {card.description}
                </Text>
              </Box>
            </Pressable>
          ))}
        </View>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -8,
  },
  cardWrapper: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 15,
  },
  card: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 40,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 12,
  },
});