import { apiClient } from '@/api/apiClient';
import { Box, Text, Button, Pressable, Heading, VStack } from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useComponentColors } from '@/hooks/useComponentColors';
import { BRAZILIAN_STATES, MONTHS, EQUIPMENT_TYPES } from '@/utils/constants';

interface EquipmentData {
  id: string;
  type: string;
  description: string;
  donorAccountId: string;
  status: string;
  removed: boolean;
  avaiabilityDate: string;
  createdAt: number;
  updatedAt: number;
}

interface DonationData {
  id: string;
  equipments: { id: string; equipmentId: string }[];
  status: string;
  createdAt: number;
}

interface DashboardStats {
  category: string;
  announced: number;
  requests: number;
}

export default function DashboardScreen() {
  useScreenTitle('Dashboards');
  const { colors } = useComponentColors();

  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // Modais de seleção
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Calcular timestamp de início/fim do mês
  const getMonthTimestamps = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    return {
      createdAtFrom: startDate.getTime(),
      createdAtTo: endDate.getTime()
    };
  };

  // Helper para gerar lista de anos (últimos 10 anos + próximo ano)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= currentYear - 10; i--) {
      years.push(i);
    }
    return years;
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Preparar filtros base para equipamentos
      const equipmentFilters: any = {};

      // Preparar filtros base para doações
      const donationFilters: any = {};

      // Aplicar filtro de estado se selecionado
      if (selectedState) {
        equipmentFilters.addressState = selectedState;
        donationFilters.addressState = selectedState;
      }

      // Aplicar filtro de período se selecionado
      if (selectedMonth) {
        const { createdAtFrom, createdAtTo } = getMonthTimestamps(selectedMonth, selectedYear);
        equipmentFilters.createdAtFrom = createdAtFrom;
        equipmentFilters.createdAtTo = createdAtTo;
        donationFilters.createdAtFrom = createdAtFrom;
        donationFilters.createdAtTo = createdAtTo;
      }

      // Determinar quais categorias buscar
      const typesToShow = selectedCategory 
        ? EQUIPMENT_TYPES.filter(t => t.value === selectedCategory)
        : EQUIPMENT_TYPES;

      // Buscar todos os equipamentos com os filtros
      let allEquipments: EquipmentData[] = [];
      try {
        allEquipments = await apiClient
          .get('/report/equipments', { params: equipmentFilters })
          .then((res) => res.data);
      } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
      }

      // Buscar todas as doações com os filtros
      let allDonations: DonationData[] = [];
      try {
        allDonations = await apiClient
          .get('/report/donations', { params: donationFilters })
          .then((res) => res.data);
      } catch (error) {
        console.error('Erro ao buscar doações:', error);
      }

      // Calcular stats para cada categoria
      const categoryStatsPromises = typesToShow.map(async (type) => {
        // Filtrar equipamentos dessa categoria
        const equipments = allEquipments.filter(eq => eq.type === type.value);
        const announced = equipments.length;
        
        // Filtrar doações relacionadas a esses equipamentos
        let requests = 0;
        if (equipments.length > 0) {
          const equipmentIds = equipments.map(eq => eq.id);
          const relatedDonations = allDonations.filter(donation => 
            donation.equipments && donation.equipments.some(de => equipmentIds.includes(de.equipmentId))
          );
          requests = relatedDonations.length;
        }

        return {
          category: type.label,
          announced,
          requests,
        };
      });

      const categoryStats = await Promise.all(categoryStatsPromises);
      setStats(categoryStats);

      // Calcular total de equipamentos disponíveis
      const availableEqs = allEquipments.filter(eq => {
        const matchesStatus = eq.status === 'Available';
        const matchesCategory = selectedCategory ? eq.type === selectedCategory : true;
        return matchesStatus && matchesCategory;
      });
      
      setAvailableEquipments(availableEqs.length);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCategory, selectedMonth, selectedYear, selectedState]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setSelectedState(null);
  };

  const hasActiveFilters = selectedCategory || selectedMonth || selectedState;

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setShowCategoryModal(false);
  };

  const handleMonthSelect = (value: number) => {
    setSelectedMonth(value);
  };

  const handleYearSelect = (value: number) => {
    setSelectedYear(value);
  };

  const handlePeriodConfirm = () => {
    setShowPeriodModal(false);
  };

  const handleStateSelect = (value: string) => {
    setSelectedState(value);
    setShowLocationModal(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <Box style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Equipamentos Anunciados x Solicitações
        </Text>

        {isLoading && (
          <Box style={[styles.loadingCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados...
            </Text>
          </Box>
        )}

        {/* Cards de status */}
        {!isLoading && (
          <Box style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <Box key={index} style={[styles.statCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                  {stat.category}
                </Text>
                <Box style={styles.progressContainer}>
                  <Box style={[styles.progressBarContainer, { backgroundColor: colors.progressBackground }]}>
                    <Box 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${Math.min((stat.announced / Math.max(stat.announced, stat.requests, 1)) * 100, 100)}%`,
                          backgroundColor: colors.success
                        }
                      ]} 
                    />
                  </Box>
                  <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                    An: {stat.announced} | Solic: {stat.requests}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Contador de equipamentos disponíveis */}
        {!isLoading && (
          <Box style={[styles.availableCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.availableText, { color: colors.textSecondary }]}>
              Saldo: +{availableEquipments} equipamentos disponíveis
            </Text>
          </Box>
        )}

        {/* Seção de filtros */}
        <Box style={styles.filtersContainer}>
          <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>
            Filtro: {selectedCategory ? EQUIPMENT_TYPES.find(t => t.value === selectedCategory)?.label : 'Categoria'} • {selectedMonth ? `${MONTHS.find(m => m.value === selectedMonth)?.label}/${selectedYear}` : 'Período'} • {selectedState || 'Localidade'}
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
            <Box style={[styles.cardModal, styles.cardModalLarge, { backgroundColor: colors.surface }]}>
              <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.modalHeaderText}>Selecione o período</Text>
              </Box>

              <VStack style={styles.modalContent}>
                {/* Seletor de ano */}
                <Box style={[styles.yearSelectorContainer, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[styles.yearSelectorLabel, { color: colors.textSecondary }]}>
                    Ano:
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.yearScrollView}
                  >
                    {getAvailableYears().map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearChip,
                          selectedYear === year && [styles.yearChipSelected, { backgroundColor: colors.primary }],
                          { borderColor: colors.border }
                        ]}
                        onPress={() => handleYearSelect(year)}
                      >
                        <Text style={[
                          styles.yearChipText,
                          { color: colors.text },
                          selectedYear === year && { color: '#fff', fontWeight: '600' }
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Box>

                {/* Seletor de mês */}
                <ScrollView style={styles.modalScrollLarge}>
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
                  onPress={handlePeriodConfirm}
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
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
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  categoryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressContainer: {
    gap: 8,
  },
  progressBarContainer: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 12,
  },
  availableCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  availableText: {
    fontSize: 14,
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
  yearSelectorContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    // borderBottomColor set inline - colors.border,
  },
  yearSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  yearScrollView: {
    flexDirection: 'row',
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  yearChipSelected: {
    // borderColor set inline - colors.primary,
  },
  yearChipText: {
    fontSize: 14,
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