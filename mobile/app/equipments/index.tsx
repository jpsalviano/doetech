import { apiClient } from '@/api/apiClient';
import Card from '@/components/Card';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useComponentColors } from '@/hooks/useComponentColors';
import { Box, Button, Fab, FabLabel } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useScreenTitle } from '../../hooks/useScreenTitle';
import { EQUIPMENT_TYPE_LABEL } from '@/utils/constants';

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

export default function EquipmentsScreen() {
  useScreenTitle('Equipamentos');

  const { account } = useUserProfile();
  const router = useRouter();

  const { colors } = useComponentColors();
  const [equipmentsArray, setEquipmentsArray] = useState<EquipmentData[]>([]);

  const getAllEquipment = React.useCallback(async (): Promise<EquipmentData[]> => {
    if (account?.role === 'Donor') {
      return apiClient
        .get(`/equipment/query/?accountId=${account.id}&removed=false`)
        .then((res) => res.data);
    }

    return apiClient
      .get('/equipment/query/?status=Available&page=1&pageSize=20')
      .then((res) => res.data);
  }, [account?.role, account?.id]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAllEquipment();
        if (!mounted) return;
        setEquipmentsArray(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [getAllEquipment]);

  return (
    <Box
      style={[
        {
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: colors.backgroundApp,
        },
      ]}
    >
      <FlatList
        data={equipmentsArray}
        style={styles.donationsList}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <Box style={{ height: 12 }} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: `/equipments/[equipmentId]`,
                params: { equipmentId: item.id },
              });
            }}
          >
            <Card
              id={item.id}
              type={item.type}
              date={new Date(Number(item.avaiabilityDate)).toLocaleDateString()}
              title={EQUIPMENT_TYPE_LABEL[item.type] ?? item.type}
              description={item.description}
            />
          </TouchableOpacity>
        )}
      />

      {account?.role === 'Donor' ? (
        <Button style={styles.fabContainer}>
          <Fab
            onPress={() => router.push('/equipments/create')}
            style={[{ backgroundColor: colors.fabBackground }, styles.fab]}
          >
            <FabLabel style={styles.fabText}>Cadastrar equipamento</FabLabel>
          </Fab>
        </Button>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  donationsList: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 800,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 80,
  },
  input: {
    marginBottom: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  searchAndCreate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fabContainer: {
    position: 'absolute',

    left: 12,
    bottom: 16,
  },
  fab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingInline: 12,
    paddingBlock: 12,
    gap: 8,
    borderRadius: 200,
  },
  fabIcon: {
    width: 20,
    height: 20,
  },
  fabText: {
    fontWeight: 600,
    textAlign: 'center',
  },
});
