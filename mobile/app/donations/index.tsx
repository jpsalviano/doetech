import { apiClient } from '@/api/apiClient';
import Card from '@/components/Card';
import { useComponentColors } from '@/hooks/useComponentColors';
import { Box } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useScreenTitle } from '../../hooks/useScreenTitle';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface Donation {
  id: string;
  recipientAccountId: string;
  equipments: any[];
  status: string;
  createdAt: number;
  updatedAt: number;
  finishedAt?: number;
}

export default function DonationsScreen() {
  useScreenTitle('Doações');
  const router = useRouter();
  const { colors } = useComponentColors();
  const { account } = useUserProfile();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchDonations = async () => {
    if (!account?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Preparar filtros baseado no role
      const params: any = {
        page: 1,
        pageSize: 100
      };

      if (account.role === 'Donor') {
        params.donorAccountId = account.id;
      } else if (account.role === 'Receptor') {
        params.recipientAccountId = account.id;
      }

      const response = await apiClient.get('/donation/query', { params });
      const donationsData = response.data || [];
      setDonations(donationsData);
      setFilteredDonations(donationsData);
    } catch (err: any) {
      console.error('Erro ao buscar doações:', err);
      setError('Erro ao buscar doações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [account?.id, account?.role]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(donation => 
        donation.status.toLowerCase().includes(searchText.toLowerCase()) ||
        donation.id.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredDonations(filtered);
    }
  }, [searchText, donations]);

  const handlePress = (donationId: string) => {
    router.push(`/donations/${donationId}` as any);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Pending': 'Pendente',
      'Approved': 'Aprovada',
      'InProgress': 'Em Andamento',
      'Finished': 'Concluída',
      'Canceled': 'Cancelada',
    };
    return statusMap[status] || status;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderDonationCard = ({ item }: { item: Donation }) => (
    <TouchableOpacity
      style={{ width: '100%' }}
      onPress={() => handlePress(item.id)}
    >
      <Card
        title={`Doação - ${getStatusLabel(item.status)}`}
        description={`${item.equipments?.length || 0} equipamento(s)`}
        date={formatDate(item.createdAt)}
      />
    </TouchableOpacity>
  );

  return (
    <Box style={[styles.container, { backgroundColor: colors.backgroundApp }]}> 
      <TextInput 
        placeholder="Pesquisar doações..." 
        style={[styles.input, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]} 
        placeholderTextColor={colors.placeholder}
        value={searchText}
        onChangeText={setSearchText}
      />

      <Box style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : filteredDonations.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma doação encontrada.
          </Text>
        ) : (
          <FlatList
            data={filteredDonations}
            renderItem={renderDonationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.donationsList}
            ItemSeparatorComponent={() => <Box style={{ height: 12 }} />}
          />
        )}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginTop: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  donationsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loader: {
    marginTop: 32,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});