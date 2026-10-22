import { apiClient } from '@/api/apiClient';
import { Box, Text, Button, Pressable, VStack } from '@gluestack-ui/themed';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useComponentColors } from '@/hooks/useComponentColors';
import { BRAZILIAN_STATES, EQUIPMENT_TYPES, MONTHS } from '@/utils/constants';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface EquipmentData {
  id: string;
  type: string;
  status: string;
  createdAt: number;
}

export default function ReusePercentageDashboard() {
  useScreenTitle('Dashboards');
  const { colors } = useComponentColors();

  const [totalAnnounced, setTotalAnnounced] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // Modais
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Preparar filtros
      const equipmentFilters: any = {};

      if (selectedState) {
        equipmentFilters.addressState = selectedState;
      }

      // Buscar todos os equipamentos
      const equipments: EquipmentData[] = await apiClient
        .get('/report/equipments', { params: equipmentFilters })
        .then((res) => res.data);

      // Filtrar por categoria se selecionado
      let filteredEquipments = equipments;
      
      if (selectedCategory) {
        filteredEquipments = filteredEquipments.filter(
          eq => eq.type === selectedCategory
        );
      }

      // Filtrar por período se selecionado
      if (selectedPeriod) {
        filteredEquipments = filteredEquipments.filter(eq => {
          const createdDate = new Date(eq.createdAt);
          return createdDate.getMonth() + 1 === selectedPeriod;
        });
      }

      // Calcular Anunciados: todos os equipamentos exceto Canceled
      const announced = filteredEquipments.filter(
        eq => eq.status !== 'Canceled'
      );
      
      // Calcular Doações: apenas equipamentos com status Finished
      const donated = filteredEquipments.filter(
        eq => eq.status === 'Finished'
      );

      setTotalAnnounced(announced.length);
      setTotalDonated(donated.length);

      // Calcular percentual
      if (announced.length > 0) {
        const calculatedPercentage = Math.round((donated.length / announced.length) * 100);
        setPercentage(calculatedPercentage);
      } else {
        setPercentage(0);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedPeriod, selectedState]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPeriod(null);
    setSelectedState(null);
  };

  const hasActiveFilters = selectedCategory || selectedPeriod || selectedState;

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setShowCategoryModal(false);
  };

  const handlePeriodSelect = (value: number) => {
    setSelectedPeriod(value);
    setShowPeriodModal(false);
  };

  const handleStateSelect = (value: string) => {
    setSelectedState(value);
    setShowLocationModal(false);
  };

  // Configuração do círculo de progresso
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;
  const remainingProgress = circumference - progress;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <Box style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Percentual de Reutilização
        </Text>

        {isLoading && (
          <Box style={[styles.loadingCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados...
            </Text>
          </Box>
        )}

        {/* Gráfico circular de percentual */}
        {!isLoading && (
          <Box style={[styles.chartCard, { backgroundColor: colors.background }]}>
            <Box style={styles.circleContainer}>
              <Svg width={size} height={size}>
                {/* Círculo de fundo (cinza claro) */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={colors.border}
                  strokeWidth={strokeWidth}
                  fill="none"
                  opacity={0.3}
                />
                
                {/* Círculo de progresso (verde) */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={colors.success}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${progress} ${remainingProgress}`}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
                
                {/* Texto do percentual */}
                <SvgText
                  x={size / 2}
                  y={size / 2 + 10}
                  fill={colors.text}
                  fontSize="48"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {percentage}%
                </SvgText>
              </Svg>
            </Box>

            {/* Informações abaixo do gráfico */}
            <Box style={styles.statsContainer}>
              <Box style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Anunciados:
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalAnnounced.toLocaleString()}
                </Text>
              </Box>

              <Box style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Doações:
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalDonated.toLocaleString()}
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Seção dos filtros */}
        <Box style={styles.filtersContainer}>
          <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>
            Filtro: {selectedCategory ? EQUIPMENT_TYPES.find(t => t.value === selectedCategory)?.label : 'Categoria'} • {selectedPeriod ? MONTHS.find(m => m.value === selectedPeriod)?.label : 'Período'} • {selectedState || 'Localidade'}
          </Text>
          
          <Box style={styles.filterButtons}>
            <Pressable 
              style={[styles.filterButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                Categoria
              </Text>
            </Pressable>
            
            <Pressable 
              style={[styles.filterButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}
              onPress={() => setShowPeriodModal(true)}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                Período
              </Text>
            </Pressable>

            <Pressable 
              style={[styles.filterButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}
              onPress={() => setShowLocationModal(true)}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                Localidade
              </Text>
            </Pressable>

            {hasActiveFilters && (
              <Pressable 
                style={[styles.filterButton, styles.clearButton, { backgroundColor: colors.primary }]}
                onPress={clearFilters}
              >
                <Text style={[styles.clearButtonText, { color: colors.textOnPrimary }]}>Limpar</Text>
              </Pressable>
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal de categoria */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Box style={[styles.cardModal, { backgroundColor: colors.surface }]}>
              <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.modalHeaderText}>Selecione a categoria</Text>
              </Box>

              <VStack style={styles.modalContent}>
                <ScrollView style={styles.modalScroll}>
                  {EQUIPMENT_TYPES.map((type, index) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.modalOption,
                        selectedCategory === type.value && [styles.modalOptionSelected, { backgroundColor: colors.primaryLight }],
                        index < EQUIPMENT_TYPES.length - 1 && { borderBottomColor: colors.border }
                      ]}
                      onPress={() => handleCategorySelect(type.value)}
                    >
                      <Text style={[
                        styles.modalOptionText, 
                        { color: colors.text },
                        selectedCategory === type.value && { fontWeight: '600' }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Button
                  onPress={() => setShowCategoryModal(false)}
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </Button>
              </VStack>
            </Box>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal de período */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Box style={[styles.cardModal, { backgroundColor: colors.surface }]}>
              <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.modalHeaderText}>Selecione o período</Text>
              </Box>

              <VStack style={styles.modalContent}>
                <ScrollView style={styles.modalScroll}>
                  {MONTHS.map((month, index) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.modalOption,
                        selectedPeriod === month.value && [styles.modalOptionSelected, { backgroundColor: colors.primaryLight }],
                        index < MONTHS.length - 1 && { borderBottomColor: colors.border }
                      ]}
                      onPress={() => handlePeriodSelect(month.value)}
                    >
                      <Text style={[
                        styles.modalOptionText, 
                        { color: colors.text },
                        selectedPeriod === month.value && { fontWeight: '600' }
                      ]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Button
                  onPress={() => setShowPeriodModal(false)}
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </Button>
              </VStack>
            </Box>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal de localização */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Box style={[styles.cardModal, styles.cardModalLarge, { backgroundColor: colors.surface }]}>
              <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.modalHeaderText}>Selecione o Estado</Text>
              </Box>

              <VStack style={styles.modalContent}>
                <ScrollView style={styles.modalScrollLarge}>
                  {BRAZILIAN_STATES.map((state, index) => (
                    <TouchableOpacity
                      key={state}
                      style={[
                        styles.modalOption,
                        selectedState === state && [styles.modalOptionSelected, { backgroundColor: colors.primaryLight }],
                        index < BRAZILIAN_STATES.length - 1 && { borderBottomColor: colors.border }
                      ]}
                      onPress={() => handleStateSelect(state)}
                    >
                      <Text style={[
                        styles.modalOptionText, 
                        { color: colors.text },
                        selectedState === state && { fontWeight: '600' }
                      ]}>
                        {state}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Button
                  onPress={() => setShowLocationModal(false)}
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </Button>
              </VStack>
            </Box>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  chartCard: {
    padding: 32,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  circleContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  filtersContainer: {
    gap: 16,
  },
  filtersTitle: {
    fontSize: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
  },
  clearButton: {
  },
  clearButtonText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardModal: {
    width: 320,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  cardModalLarge: {
    maxHeight: 550,
  },
  modalHeader: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalScrollLarge: {
    maxHeight: 300,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  modalOptionSelected: {
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalButton: {
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
