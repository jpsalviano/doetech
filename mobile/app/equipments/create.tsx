import { apiClient } from '@/api/apiClient';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useComponentColors } from '@/hooks/useComponentColors';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { applyDateMask } from '@/utils/masks';
import { Box, Button, ButtonText, Input, InputField, Text } from '@gluestack-ui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import SelectInput from '../../components/SelectInput';

interface Payload {
  description: string;
  donorAccountId: string;
  type: string;
  status: string;
  avaiabilityDate: number;
  createdAt: number;
  updatedAt: number;
}

export default function CreateDonationScreen() {
  const { colors, formColors, formStyles } = useComponentColors();

  const params = useLocalSearchParams();
  const { account } = useUserProfile();

  const isEditing = !!params.equipmentId;

  const [message, setMessage] = useState('');
  const [donationTitle, setDonationTitle] = useState('');
  const [availability, setAvailability] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const statusOptions = [
    { label: 'Em Progresso', value: 'InProgress' },
    { label: 'Cancelado', value: 'Canceled' },
    { label: 'Finalizado', value: 'Finished' },
  ];

  const typeOptions = [
    { label: 'Computador', value: 'Desktop' },
    { label: 'Smartphone', value: 'SmartPhone' },
    { label: 'Tablet', value: 'Tablet' },
    { label: 'Notebook', value: 'Notebook' },
    { label: 'Periféricos', value: 'Peripherals' },
  ];

  const router = useRouter();

  const getEquipmentData = useCallback(async () => {
    if (!!params.equipmentId) {
      const res = await apiClient
        .get(`/equipment/${params.equipmentId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.error(err);
          setMessage('Erro ao carregar dados do equipamento');
        });

      setDonationTitle(res.description as string);
      setAvailability(
        new Date(Number(res.avaiabilityDate as string)).toLocaleDateString()
      );
      setCategory(res.type as string);
      setStatus(res.status as string);
    } else {
      setStatus('Available');
    }
  }, [params.equipmentId]);

  useEffect(() => {
    getEquipmentData();
  }, [getEquipmentData]);

  const parseDataString = (dateStr: string): number => {
    const [day, month, year]: string[] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
  };

  const handleCreateDonation = (payload: Payload) => {
    if (donationTitle !== '' && availability !== '' && category !== '' && status !== '') {
      try {
        apiClient.post('/equipment', payload).then(() => router.push('/equipments'));
      } catch (err) {
        console.error(err);
        setMessage('Erro ao criar equipamento');
      }
    } else {
      setMessage('Preencha todos os campos');
    }
  };

  const handleUpdateStatus = (equipmentId: string) => {
    try {
      apiClient
        .put(`/equipment/${equipmentId}/status`, {
          status,
        })
        .then(() => router.push('/equipments'));
    } catch (err) {
      console.error(err);
      setMessage('Erro ao atualizar status do equipamento');
    }
  };

  useScreenTitle(isEditing ? 'Editar equipamento' : 'Cadastrar equipamento');

  const renderInput = (
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    isDisabled?: boolean,
    keyboardType?: any,
    maxLength?: number,
    customStyle?: any
  ) => (
    <Input isDisabled={isDisabled} style={[formStyles.input, customStyle]}>
      <InputField
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={[
          formStyles.inputField,
          {
            color:
              isDisabled || value === ''
                ? formColors.placeholder
                : formStyles.inputField.color,
          },
        ]}
        placeholderTextColor={formColors.placeholder}
      />
    </Input>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="center"
        />

        {message ? (
          <Box style={{ marginBottom: 12 }}>
            <Text style={[styles.errorText, { color: colors.error }]}>{message}</Text>
          </Box>
        ) : null}
        <Box>
          <Box style={styles.container}>
            <SelectInput
              options={typeOptions}
              value={category}
              onChange={(v) => setCategory(v)}
              containerStyle={formStyles.input as any}
              buttonStyle={formStyles.inputField as any}
              isDisabled={isEditing}
            />

            {renderInput(
              donationTitle,
              setDonationTitle,
              'Descrição do equipamento',
              isEditing
            )}
            {renderInput(
              availability,
              (val) => setAvailability(applyDateMask(val)),
              'Disponibilidade (DD/MM/AAAA)',
              isEditing
            )}

            {isEditing && (
              <SelectInput
                options={statusOptions}
                value={status}
                onChange={(v) => setStatus(v)}
                containerStyle={formStyles.input as any}
                buttonStyle={formStyles.inputField as any}
              />
            )}
          </Box>

          {isEditing ? (
            account?.role === 'Receptor' ? null : (
              <Button
                style={formStyles.button}
                onPress={() => handleUpdateStatus(params.equipmentId as string)}
              >
                <ButtonText style={formStyles.buttonText}>Atualizar status</ButtonText>
              </Button>
            )
          ) : (
            <Button
              style={formStyles.button}
              onPress={() => {
                handleCreateDonation({
                  description: donationTitle,
                  donorAccountId: account?.id as string,
                  type: category,
                  status: status,
                  avaiabilityDate: parseDataString(availability),
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }}
            >
              <ButtonText style={formStyles.buttonText}>Cadastrar equipamento</ButtonText>
            </Button>
          )}
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  logo: {
    alignSelf: 'center',
    maxHeight: 300,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingInline: 32,
    paddingBlock: 24,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  container: {
    gap: 12,
  },
  wrapper: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});