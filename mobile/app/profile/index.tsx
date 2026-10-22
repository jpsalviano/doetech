import { useComponentColors } from '@/hooks/useComponentColors';
import { Box, Text, Spinner } from '@gluestack-ui/themed';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { apiClient } from '../../api/apiClient';
import ProfileForm from '../../components/ProfileForm';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useScreenTitle } from '../../hooks/useScreenTitle';

export default function ProfileScreen() {
  useScreenTitle("Perfil");
  const { account, loading, refreshAccount } = useUserProfile();
  const isFocused = useIsFocused();
  const { colors } = useComponentColors();

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phoneState, setPhoneState] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [allowsAdvertising, setAllowsAdvertising] = useState(false);
  const [role, setRole] = useState("");
  const [personType, setPersonType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isFocused) {
      refreshAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useEffect(() => {
    if (account) {
      const birthdayDate = account.birthdayDate ? new Date(account.birthdayDate).toLocaleDateString("pt-BR") : "";
      setName(account.name || account.businessName || "");
      setCpf(account.cpf || "");
      setCnpj(account.cnpj || "");
      setBirthday(birthdayDate);
      setPhoneState(account.phone?.stateCode || "");
      setPhoneNumber(account.phone?.phoneNumber || "");
      setAddressStreet(account.address?.street || "");
      setAddressNumber(account.address?.number || "");
      setAddressCity(account.address?.city || "");
      setAddressDistrict(account.address?.district || "");
      setAddressState(account.address?.state || "");
      setAddressComplement(account.address?.complement || "");
      setAddressPostalCode(account.address?.postalCode || "");
      setAllowsAdvertising(account.allowsAdvertising);
      setRole(account.role);
      setPersonType(account.cpf ? "fisica" : "juridica");
    }
  }, [account]);

  const handleSubmit = async () => {
    if (!account) return;
    setMessage("");
    setIsSubmitting(true);

    try {
      const birthdayConverted = (birthStr: string) => {
        const [day, month, year] = birthStr.split("/");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
      };

      const payload: any = {
        userId: account.userId,
        role: role,
        allowsAdvertising,
        active: account.active,
        phone: {
          countryCode: "55",
          stateCode: phoneState || "",
          phoneNumber: phoneNumber || "",
        },
        address: {
          street: addressStreet,
          number: addressNumber,
          city: addressCity,
          district: addressDistrict,
          state: addressState,
          complement: addressComplement || undefined,
          postalCode: addressPostalCode,
        },
      };
      
      if (personType === "fisica") {
        payload.name = name;
        payload.cpf = cpf;
      } else {
        payload.businessName = name;
        payload.cnpj = cnpj;
      }

      if (birthday) payload.birthdayDate = birthdayConverted(birthday);

      await apiClient.put(`/account/${account.id}`, payload);
      setMessage("Perfil atualizado!");
      await refreshAccount();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Erro ao atualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar loader enquanto carrega
  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.backgroundApp }]}>
        <Spinner size="large" color={colors.primary} />
        <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.backgroundApp }}>
      <ProfileForm
        id={account?.id || ""}
        name={name}
        setName={setName}
        cpf={cpf}
        setCpf={setCpf}
        cnpj={cnpj}
        setCnpj={setCnpj}
        birthday={birthday}
        setBirthday={setBirthday}
        phoneState={phoneState}
        setPhoneState={setPhoneState}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        addressStreet={addressStreet}
        setAddressStreet={setAddressStreet}
        addressNumber={addressNumber}
        setAddressNumber={setAddressNumber}
        addressCity={addressCity}
        setAddressCity={setAddressCity}
        addressDistrict={addressDistrict}
        setAddressDistrict={setAddressDistrict}
        addressState={addressState}
        setAddressState={setAddressState}
        addressComplement={addressComplement}
        setAddressComplement={setAddressComplement}
        addressPostalCode={addressPostalCode}
        setAddressPostalCode={setAddressPostalCode}
        allowsAdvertising={allowsAdvertising}
        setAllowsAdvertising={setAllowsAdvertising}
        role={role}
        personType={personType}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        message={message}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loaderText: {
    fontSize: 16,
    marginTop: 12,
  },
});