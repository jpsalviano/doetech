import { apiClient } from '@/api/apiClient';
import { Box, Text, Button, Pressable, VStack } from '@gluestack-ui/themed';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useComponentColors } from '@/hooks/useComponentColors';
import { BRAZILIAN_STATES, EQUIPMENT_TYPES, DONATION_STATUS, TIME_INTERVALS } from '@/utils/constants';

interface DonationData {
  id: string;
  equipments: { id: string; equipmentId: string }[];
  recipientAccountId: string;
  donorAccountId: string;
  status: string;
  createdAt: number;
  finishedAt: number;
}

interface EquipmentData {
  id: string;
  type: string;
}

interface HistogramData {
  interval: string;
  count: number;
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export default function DonationTimeDashboard() {
  useScreenTitle('Dashboards');
  const { colors } = useComponentColors();

  const [averageDays, setAverageDays] = useState(0);
  const [histogramData, setHistogramData] = useState<HistogramData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtros
  const [selectedDonationType, setSelectedDonationType] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // Modais
  const [showDonationTypeModal, setShowDonationTypeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Preparar filtros para doações
      const donationFilters: any = {};
      
      if (selectedState) {
        donationFilters.addressState = selectedState;
      }

      // Buscar doações finalizadas
      const donations: DonationData[] = await apiClient
        .get('/report/donations', { params: donationFilters })
        .then((res) => res.data);

      // Filtrar doações finalizadas (InProgress -> Finished)
      const finishedDonations = donations.filter(
        donation => donation.status === DONATION_STATUS.FINISHED && donation.finishedAt > 0
      );

      // Se temos filtro de tipo de doação, precisamos buscar os equipamentos
      let filteredDonations = finishedDonations;
      
      if (selectedDonationType) {
        const equipmentFilters: any = {};
        
        if (selectedState) {
          equipmentFilters.addressState = selectedState;
        }

        const equipments: EquipmentData[] = await apiClient
          .get('/report/equipments', { params: equipmentFilters })
          .then((res) => res.data);

        // Filtrar equipamentos pelo tipo selecionado
        const filteredEquipmentIds = equipments
          .filter(eq => eq.type === selectedDonationType)
          .map(eq => eq.id);

        // Filtrar doações que contenham pelo menos um equipamento do tipo selecionado
        filteredDonations = finishedDonations.filter(donation =>
          donation.equipments?.some(de => filteredEquipmentIds.includes(de.equipmentId))
        );
      }

      // Calcular tempo de cada doação (em dias)
      const donationTimes = filteredDonations.map(donation => {
        const timeInMs = donation.finishedAt - donation.createdAt;
        const timeInDays = Math.round(timeInMs / MILLISECONDS_PER_DAY);
        return timeInDays;
      });

      // Calcular média
      if (donationTimes.length > 0) {
        const sum = donationTimes.reduce((acc, time) => acc + time, 0);
        const avg = Math.round(sum / donationTimes.length);
        setAverageDays(avg);
      } else {
        setAverageDays(0);
      }

      // Calcular distribuição para o histograma
      const distribution: HistogramData[] = TIME_INTERVALS.map(interval => {
        const count = donationTimes.filter(days => {
          if (interval.max === Infinity) {
            return days >= interval.min;
          }
          return days >= interval.min && days <= interval.max;
        }).length;

        return {
          interval: interval.label,
          count,
        };
      });

      setHistogramData(distribution);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDonationType, selectedState]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const clearFilters = () => {
    setSelectedDonationType(null);
    setSelectedState(null);
  };

  const hasActiveFilters = selectedDonationType || selectedState;

  const handleDonationTypeSelect = (value: string) => {
    setSelectedDonationType(value);
    setShowDonationTypeModal(false);
  };

  const handleStateSelect = (value: string) => {
    setSelectedState(value);
    setShowLocationModal(false);
  };

  // Calcular altura máxima das barras do histograma
  const maxCount = Math.max(...histogramData.map(d => d.count), 1);
  const screenWidth = Dimensions.get('window').width;
  const chartPadding = 48;
  const barWidth = (screenWidth - chartPadding * 2) / histogramData.length - 8;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <Box style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Tempo médio atual em processos de{'\n'}doação
        </Text>

        {isLoading && (
          <Box style={[styles.loadingCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados...
            </Text>
          </Box>
        )}

        {/* Média destacada */}
        {!isLoading && (
          <Box style={[styles.averageCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.averageValue, { color: colors.primary }]}>
              {averageDays} dias
            </Text>
          </Box>
        )}

        {/* Histograma */}
        {!isLoading && (
          <Box style={[styles.chartCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Distribuição no tempo (dias)
            </Text>
            
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              Histograma mostrando a frequência por{'\n'}intervalo de dias
            </Text>

            <Box style={styles.histogramContainer}>
              {histogramData.map((data, index) => {
                const barHeight = maxCount > 0 ? (data.count / maxCount) * 150 : 0;
                
                return (
                  <Box key={index} style={[styles.barContainer, { width: barWidth }]}>
                    <Box style={styles.barWrapper}>
                      <Box 
                        style={[
                          styles.bar, 
                          { 
                            height: barHeight,
                            backgroundColor: colors.primary,
                            width: barWidth - 4,
                          }
                        ]} 
                      />
                    </Box>
                    <Text 
                      style={[
                        styles.barCount, 
                        { color: colors.text }
                      ]}
                    >
                      {data.count}
                    </Text>
                    <Text 
                      style={[
                        styles.barLabel, 
                        { color: colors.textSecondary }
                      ]}
                      numberOfLines={2}
                    >
                      {data.interval}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Seção dos filtros */}
        <Box style={styles.filtersContainer}>
          <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>
            Filtro: {selectedDonationType ? EQUIPMENT_TYPES.find(t => t.value === selectedDonationType)?.label : 'Tipo de doação'} • {selectedState || 'Localidade'}
          </Text>
          
          <Box style={styles.filterButtons}>
            <Pressable 
              style={[styles.filterButton, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}
              onPress={() => setShowDonationTypeModal(true)}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                Tipo de doação
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

      {/* Modal de tipo de doação */}
      <Modal
        visible={showDonationTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDonationTypeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDonationTypeModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Box style={[styles.cardModal, { backgroundColor: colors.surface }]}>
              <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
                <Text style={styles.modalHeaderText}>Selecione o tipo de doação</Text>
              </Box>

              <VStack style={styles.modalContent}>
                <ScrollView style={styles.modalScroll}>
                  {EQUIPMENT_TYPES.map((type, index) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.modalOption,
                        selectedDonationType === type.value && [styles.modalOptionSelected, { backgroundColor: colors.primaryLight }],
                        index < EQUIPMENT_TYPES.length - 1 && { borderBottomColor: colors.border }
                      ]}
                      onPress={() => handleDonationTypeSelect(type.value)}
                    >
                      <Text style={[
                        styles.modalOptionText, 
                        { color: colors.text },
                        selectedDonationType === type.value && { fontWeight: '600' }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Button
                  onPress={() => setShowDonationTypeModal(false)}
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
    lineHeight: 26,
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
  averageCard: {
    padding: 32,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  averageValue: {
    fontSize: 56,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  histogramContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
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
