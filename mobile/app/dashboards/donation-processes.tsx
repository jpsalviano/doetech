import { apiClient } from '@/api/apiClient';
import { Box, Text, Button, Pressable, VStack } from '@gluestack-ui/themed';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useComponentColors } from '@/hooks/useComponentColors';
import { BRAZILIAN_STATES, EQUIPMENT_TYPES, MONTHS } from '@/utils/constants';
import Svg, { Polyline, Circle, Text as SvgText, Line } from 'react-native-svg';

interface DonationData {
  id: string;
  equipments: { id: string; equipmentId: string }[];
  recipientAccountId: string;
  status: string;
  createdAt: number;
  finishedAt: number;
}

interface EquipmentData {
  id: string;
  type: string;
}

interface MonthlyData {
  month: string;
  count: number;
}

export default function DonationProcessesDashboard() {
  useScreenTitle('Dashboards');
  const { colors } = useComponentColors();

  const [totalDonations, setTotalDonations] = useState(0);
  const [totalEquipments, setTotalEquipments] = useState(0);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtros
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // Modais
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Preparar filtros base
      const donationFilters: any = {};
      const equipmentFilters: any = {};

      if (selectedState) {
        donationFilters.addressState = selectedState;
        equipmentFilters.addressState = selectedState;
      }

      // Buscar todas as doações
      const donations: DonationData[] = await apiClient
        .get('/report/donations', { params: donationFilters })
        .then((res) => res.data);

      // Buscar todos os equipamentos
      const equipments: EquipmentData[] = await apiClient
        .get('/report/equipments', { params: equipmentFilters })
        .then((res) => res.data);

      // Filtrar doações finalizadas
      let filteredDonations = donations.filter(
        donation => donation.status === 'Finished' && donation.finishedAt > 0
      );

      // Aplicar filtro de categoria (tipo de equipamento)
      if (selectedCategory) {
        const filteredEquipmentIds = equipments
          .filter(eq => eq.type === selectedCategory)
          .map(eq => eq.id);

        filteredDonations = filteredDonations.filter(donation =>
          donation.equipments?.some(de => filteredEquipmentIds.includes(de.equipmentId))
        );
      }

      // Aplicar filtro de mês
      if (selectedMonth) {
        filteredDonations = filteredDonations.filter(donation => {
          const finishDate = new Date(donation.finishedAt);
          return finishDate.getMonth() + 1 === selectedMonth;
        });
      }

      // Calcular totais
      setTotalDonations(filteredDonations.length);

      // Calcular total de equipamentos envolvidos nas doações filtradas
      const equipmentCount = filteredDonations.reduce((sum, donation) => {
        return sum + (donation.equipments?.length || 0);
      }, 0);
      setTotalEquipments(equipmentCount);

      // Calcular total de beneficiários únicos
      const uniqueRecipients = new Set(
        filteredDonations.map(donation => donation.recipientAccountId)
      );
      setTotalBeneficiaries(uniqueRecipients.size);

      // Calcular evolução mensal (últimos 6 meses)
      const monthlyData: MonthlyData[] = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentDate);
        targetDate.setMonth(currentDate.getMonth() - i);
        const month = targetDate.getMonth() + 1;
        const year = targetDate.getFullYear();

        const monthName = MONTHS.find(m => m.value === month)?.label.slice(0, 3) || '';

        const count = filteredDonations.filter(donation => {
          const finishDate = new Date(donation.finishedAt);
          return finishDate.getMonth() + 1 === month && finishDate.getFullYear() === year;
        }).length;

        monthlyData.push({
          month: monthName,
          count,
        });
      }

      setMonthlyEvolution(monthlyData);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedCategory, selectedState]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedCategory(null);
    setSelectedState(null);
  };

  const hasActiveFilters = selectedMonth || selectedCategory || selectedState;

  const handleMonthSelect = (value: number) => {
    setSelectedMonth(value);
    setShowMonthModal(false);
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setShowCategoryModal(false);
  };

  const handleStateSelect = (value: string) => {
    setSelectedState(value);
    setShowLocationModal(false);
  };

  // Preparar dados para o gráfico de linha
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 80;
  const chartHeight = 180;
  const maxValue = Math.max(...monthlyEvolution.map(d => d.count), 1);
  const padding = 30;

  const points = monthlyEvolution.map((data, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (monthlyEvolution.length - 1);
    const y = chartHeight - padding - ((data.count / maxValue) * (chartHeight - padding * 2));
    return `${x},${y}`;
  }).join(' ');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <Box style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Processos de doação - DoeTech
        </Text>

        {isLoading && (
          <Box style={[styles.loadingCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados...
            </Text>
          </Box>
        )}

        {/* Totais */}
        {!isLoading && (
          <Box style={styles.totalsContainer}>
            <Box style={[styles.totalCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                Doações Totais
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {totalDonations.toLocaleString()}
              </Text>
            </Box>

            <Box style={[styles.totalCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                Reutilizações
              </Text>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                {totalEquipments.toLocaleString()}
              </Text>
            </Box>
          </Box>
        )}

        {/* Visão Geral - Evolução mensal */}
        {!isLoading && (
          <Box style={[styles.chartCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Visão Geral
            </Text>
            
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              Evolução mensal
            </Text>

            <Box style={styles.lineChartContainer}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* Linhas de grade horizontais */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const y = padding + (i * (chartHeight - padding * 2)) / 4;
                  return (
                    <Line
                      key={i}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke={colors.border}
                      strokeWidth="1"
                      opacity={0.3}
                    />
                  );
                })}

                {/* Linha de tendência */}
                <Polyline
                  points={points}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth="3"
                />

                {/* Pontos nos dados */}
                {monthlyEvolution.map((data, index) => {
                  const x = padding + (index * (chartWidth - padding * 2)) / (monthlyEvolution.length - 1);
                  const y = chartHeight - padding - ((data.count / maxValue) * (chartHeight - padding * 2));
                  
                  return (
                    <React.Fragment key={index}>
                      <Circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={colors.primary}
                      />
                      {/* Labels dos meses */}
                      <SvgText
                        x={x}
                        y={chartHeight - 10}
                        fill={colors.textSecondary}
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {data.month}
                      </SvgText>
                      {/* Valores */}
                      <SvgText
                        x={x}
                        y={y - 10}
                        fill={colors.text}
                        fontSize="12"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {data.count}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </Box>
          </Box>
        )}

        {/* Beneficiários */}
        {!isLoading && (
          <Box style={[styles.beneficiariesCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.beneficiariesLabel, { color: colors.textSecondary }]}>
              Beneficiários
            </Text>
            <Text style={[styles.beneficiariesValue, { color: colors.text }]}>
              {totalBeneficiaries.toLocaleString()}
            </Text>
            <Text style={[styles.beneficiariesSubtitle, { color: colors.textSecondary }]}>
              Pessoas + Instituições
            </Text>
          </Box>
        )}

        {/* Seção dos filtros */}
        <Box style={styles.filtersContainer}>
          <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>
            Filtros: {selectedMonth ? MONTHS.find(m => m.value === selectedMonth)?.label : 'Mês'} • {selectedCategory ? EQUIPMENT_TYPES.find(t => t.value === selectedCategory)?.label : 'Categoria'} • {selectedState || 'Localidade'}
          </Text>
          
          <Box style={styles.filterButtons}>
            <Pressable 
              style={[styles.filterButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}
              onPress={() => setShowMonthModal(true)}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                Mês
              </Text>
            </Pressable>
            
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

      {/* Modal de mês */}
      <Modal
        visible={showMonthModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Box style={[styles.cardModal, { backgroundColor: colors.surface }]}>
              <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.modalHeaderText}>Selecione o mês</Text>
              </Box>

              <VStack style={styles.modalContent}>
                <ScrollView style={styles.modalScroll}>
                  {MONTHS.map((month, index) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.modalOption,
                        selectedMonth === month.value && [styles.modalOptionSelected, { backgroundColor: colors.primaryLight }],
                        index < MONTHS.length - 1 && { borderBottomColor: colors.border }
                      ]}
                      onPress={() => handleMonthSelect(month.value)}
                    >
                      <Text style={[
                        styles.modalOptionText, 
                        { color: colors.text },
                        selectedMonth === month.value && { fontWeight: '600' }
                      ]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Button
                  onPress={() => setShowMonthModal(false)}
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </Button>
              </VStack>
            </Box>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  totalsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  totalCard: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  chartCard: {
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  lineChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  beneficiariesCard: {
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  beneficiariesLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  beneficiariesValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 4,
  },
  beneficiariesSubtitle: {
    fontSize: 12,
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
