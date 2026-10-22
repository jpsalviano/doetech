import { apiClient } from '@/api/apiClient';
import { Box, Text, Button, Pressable, VStack } from '@gluestack-ui/themed';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import { useComponentColors } from '@/hooks/useComponentColors';
import { BRAZILIAN_STATES, MONTHS } from '@/utils/constants';

interface AccountData {
  id: string;
  name: string;
  businessName: string;
  cpf: string;
  cnpj: string;
  role: string;
  createdAt: number;
}

interface DonationData {
  id: string;
  equipments: { id: string; equipmentId: string }[];
  recipientAccountId: string;
  donorAccountId: string;
  status: string;
  createdAt: number;
}

interface EquipmentData {
  id: string;
  donorAccountId: string;
}

interface TopInstitution {
  name: string;
  count: number;
}

export default function BeneficiariesDashboard() {
  useScreenTitle('Dashboards');
  const { colors } = useComponentColors();

  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [individualsCount, setIndividualsCount] = useState(0);
  const [institutionsCount, setInstitutionsCount] = useState(0);
  const [topInstitutions, setTopInstitutions] = useState<TopInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtros
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // Modais
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

  // Helper para gerar lista de anos
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
      // Preparar filtros para accounts
      const accountFilters: any = {};

      if (selectedState) {
        accountFilters.addressState = selectedState;
      }

      if (selectedMonth) {
        const { createdAtFrom, createdAtTo } = getMonthTimestamps(selectedMonth, selectedYear);
        accountFilters.createdAtFrom = createdAtFrom;
        accountFilters.createdAtTo = createdAtTo;
      }

      // Buscar accounts (beneficiários = Receptor)
      let allAccounts: AccountData[] = [];
      try {
        allAccounts = await apiClient
          .get('/report/accounts', { params: accountFilters })
          .then((res) => res.data);
        
        // Filtrar apenas receptores

        console.log('Contas recuperadas:', allAccounts);
        allAccounts = allAccounts.filter(acc => acc.role === 'Receptor');
      } catch (error) {
        console.error('Erro ao buscar contas:', error);
      }

      // Separar pessoas físicas e jurídicas
      const individuals = allAccounts.filter(acc => acc.cpf && acc.cpf.length > 0);
      const institutions = allAccounts.filter(acc => acc.cnpj && acc.cnpj.length > 0);

      setTotalBeneficiaries(allAccounts.length);
      setIndividualsCount(individuals.length);
      setInstitutionsCount(institutions.length);

      // Buscar donations e equipments para calcular top 5 instituições
      try {
        const [donations, equipments]: [DonationData[], EquipmentData[]] = await Promise.all([
          apiClient.get('/report/donations', { params: {} }).then(res => res.data),
          apiClient.get('/report/equipments', { params: {} }).then(res => res.data)
        ]);

        // Contar doações por instituição
        const institutionDonationCount = new Map<string, number>();

        institutions.forEach(institution => {
          // Contar equipments doados por essa instituição
          const donatedEquipments = equipments.filter(eq => eq.donorAccountId === institution.id);
          const donatedEquipmentIds = donatedEquipments.map(eq => eq.id);

          // Contar donations que incluem esses equipments
          const relatedDonations = donations.filter(donation =>
            donation.equipments?.some(de => donatedEquipmentIds.includes(de.equipmentId))
          );

          if (relatedDonations.length > 0) {
            institutionDonationCount.set(institution.id, relatedDonations.length);
          }
        });

        // Ordenar e pegar top 5
        const sortedInstitutions = Array.from(institutionDonationCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([accountId, count]) => {
            const institution = institutions.find(inst => inst.id === accountId);
            return {
              name: institution?.businessName || institution?.name || 'Instituição',
              count
            };
          });

        setTopInstitutions(sortedInstitutions);
      } catch (error) {
        console.error('Erro ao calcular top instituições:', error);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear, selectedState]);

  const clearFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(new Date().getFullYear());
    setSelectedState(null);
  };

  const hasActiveFilters = selectedMonth || selectedState;

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

  // Cálculos para o gráfico circular
  const total = individualsCount + institutionsCount;
  const individualsPercentage = total > 0 ? (individualsCount / total) * 100 : 0;
  const institutionsPercentage = total > 0 ? (institutionsCount / total) * 100 : 0;

  // Parâmetros do círculo
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calcular offset para cada segmento
  const individualsOffset = circumference - (individualsPercentage / 100) * circumference;
  const institutionsOffset = circumference - (institutionsPercentage / 100) * circumference;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <Box style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Total de Beneficiários
        </Text>

        {isLoading && (
          <Box style={[styles.loadingCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados...
            </Text>
          </Box>
        )}

        {/* Chart circular */}
        {!isLoading && (
          <Box style={[styles.chartCard, { backgroundColor: colors.background }]}>
            <Box style={styles.chartContainer}>
              <Svg width={size} height={size}>
                {/* Círculo de fundo */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={colors.border}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                
                {/* Segmento de instituições (CNPJ) */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={colors.success}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={institutionsOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
                
                {/* Segmento de pessoas físicas */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={colors.info}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={individualsOffset}
                  strokeLinecap="round"
                  rotation={-90 + (institutionsPercentage * 3.6)}
                  origin={`${size / 2}, ${size / 2}`}
                />

                {/* Texto central */}
                <SvgText
                  x={size / 2}
                  y={size / 2}
                  fontSize="48"
                  fontWeight="bold"
                  fill={colors.text}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {totalBeneficiaries}
                </SvgText>
              </Svg>
            </Box>

            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
              Pessoas físicas: {individualsCount} • Instituições: {institutionsCount}
            </Text>
          </Box>
        )}

        {/* Top 5 - instituições doadoras */}
        {!isLoading && topInstitutions.length > 0 && (
          <Box style={[styles.topCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.topTitle, { color: colors.text }]}>
              Top 5 Instituições doadoras
            </Text>
            
            <Box style={styles.topList}>
              {topInstitutions.map((institution, index) => (
                <Box key={index} style={styles.topItem}>
                  <Text style={[styles.topItemText, { color: colors.textSecondary }]}>
                    {index + 1}. {institution.name} — {institution.count}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Seção dos filtros */}
        <Box style={styles.filtersContainer}>
          <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>
            Filtro: {selectedMonth ? `${MONTHS.find(m => m.value === selectedMonth)?.label}/${selectedYear}` : 'Período'} • {selectedState || 'Localidade'}
          </Text>
          
          <Box style={styles.filterButtons}>
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
                style={[styles.filterButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </Pressable>
            )}
          </Box>
        </Box>
      </Box>

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
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  topCard: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  topList: {
    gap: 12,
  },
  topItem: {
    paddingVertical: 4,
  },
  topItemText: {
    fontSize: 14,
    lineHeight: 20,
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
    color: '#fff',
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