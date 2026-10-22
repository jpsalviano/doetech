import {
  Box,
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  Text,
  VStack,
  Image,
} from "@gluestack-ui/themed";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "../api/apiClient";
import SelectInput from "./SelectInput";
import { BRAZILIAN_STATES } from "@/utils/constants";
import { useComponentColors } from "@/hooks/useComponentColors";

interface ProfileFormProps {
  id: string;
  name: string;
  setName: (value: string) => void;
  cpf: string;
  setCpf: (value: string) => void;
  cnpj: string;
  setCnpj: (value: string) => void;
  birthday: string;
  setBirthday: (value: string) => void;
  phoneState: string;
  setPhoneState: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  addressStreet: string;
  setAddressStreet: (value: string) => void;
  addressNumber: string;
  setAddressNumber: (value: string) => void;
  addressCity: string;
  setAddressCity: (value: string) => void;
  addressDistrict: string;
  setAddressDistrict: (value: string) => void;
  addressState: string;
  setAddressState: (value: string) => void;
  addressComplement: string;
  setAddressComplement: (value: string) => void;
  addressPostalCode: string;
  setAddressPostalCode: (value: string) => void;
  allowsAdvertising: boolean;
  setAllowsAdvertising: (value: boolean) => void;
  role: string;
  personType: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  message: string;
}

const renderInput = (
  value: string,
  onChange: (val: string) => void,
  placeholder: string,
  colors: any,
  formStyles: any,
  keyboardType?: any,
  maxLength?: number,
  customStyle?: any
) => (
  <Input
    style={[
      formStyles.input,
      { backgroundColor: colors.inputBackground },
      customStyle,
    ]}
  >
    <InputField
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={keyboardType}
      maxLength={maxLength}
      style={[formStyles.inputField, { color: colors.text }]}
      placeholderTextColor={colors.placeholder}
    />
  </Input>
);

export default function ProfileForm(props: ProfileFormProps) {
  const { colors, formStyles } = useComponentColors();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Carrega imagem de perfil
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await apiClient.get(
          `/file/ProfilePicture/${props.id}`
        );
        setProfileImage(response.data.url);
      } catch (error) {
        console.warn("Erro ao carregar imagem de perfil:", error);
      }
    };
    fetchProfileImage();
  }, [props.id]);

  // Seleção de imagem (câmera ou galeria)
  const pickImage = async () => {
    Alert.alert("Foto de perfil", "Selecione uma opção", [
      {
        text: "Câmera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) return;
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled) setNewImage(result.assets[0].uri);
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled) setNewImage(result.assets[0].uri);
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  // Upload da nova imagem
  const uploadProfileImage = async () => {
    if (!newImage) return;

    const formData = new FormData();
    formData.append("file", {
      uri: newImage,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await apiClient.post(
        `/file/ProfilePicture/${props.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setProfileImage(response.data.url);
      setNewImage(null);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      Alert.alert("Erro", "Não foi possível enviar a foto de perfil.");
    }
  };

  const handleSubmit = async () => {
    await uploadProfileImage();
    props.onSubmit();
  };

  return (
    <Box style={formStyles.container}>
      <VStack style={formStyles.form}>
        {props.message ? (
          <Box
            style={[
              styles.messageBox,
              { backgroundColor: colors.infoBackground },
            ]}
          >
            <Text style={[styles.message, { color: colors.infoText }]}>
              {props.message}
            </Text>
          </Box>
        ) : null}

        <HStack style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            {imageError || (!newImage && !profileImage) ? (
              <Box
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: colors.border },
                ]}
              >
                <MaterialIcons name="person" size={60} color={colors.icon} />
              </Box>
            ) : (
              <Image
                source={{ uri: newImage || profileImage || undefined }}
                alt="Profile Picture"
                style={styles.profileImage}
                onError={() => setImageError(true)}
              />
            )}
          </TouchableOpacity>

          <Box>
            <VStack style={styles.profileInfo}>
              <VStack style={styles.infoSection}>
                <Text
                  style={[formStyles.label, { color: colors.textSecondary }]}
                >
                  Usuário
                </Text>
                <Text style={[formStyles.value, { color: colors.text }]}>
                  {props.role === "Donor" ? "Doador" : "Receptor"}
                </Text>
              </VStack>

              <VStack style={styles.infoSection}>
                <Text
                  style={[formStyles.label, { color: colors.textSecondary }]}
                >
                  Pessoa
                </Text>
                <Text style={[formStyles.value, { color: colors.text }]}>
                  {props.personType === "fisica" ? "Física" : "Jurídica"}
                </Text>
              </VStack>

              <VStack style={styles.infoSection}>
                <Text
                  style={[formStyles.label, { color: colors.textSecondary }]}
                >
                  {props.personType === "fisica" ? "CPF" : "CNPJ"}
                </Text>
                <Text style={[formStyles.value, { color: colors.text }]}>
                  {props.personType === "fisica" ? props.cpf : props.cnpj}
                </Text>
              </VStack>
            </VStack>
          </Box>
        </HStack>

        {renderInput(
          props.name,
          props.setName,
          "Nome completo",
          colors,
          formStyles
        )}
        {renderInput(
          props.birthday,
          props.setBirthday,
          "Data de nascimento (DD/MM/AAAA)",
          colors,
          formStyles
        )}

        <HStack style={formStyles.row}>
          {renderInput(
            props.phoneState,
            props.setPhoneState,
            "DDD",
            colors,
            formStyles,
            "numeric",
            2,
            styles.dddInput
          )}
          {renderInput(
            props.phoneNumber,
            props.setPhoneNumber,
            "Número do telefone",
            colors,
            formStyles,
            "numeric",
            undefined,
            styles.phoneInput
          )}
        </HStack>

        <HStack style={formStyles.row}>
          {renderInput(
            props.addressStreet,
            props.setAddressStreet,
            "Rua",
            colors,
            formStyles,
            undefined,
            undefined,
            styles.streetInput
          )}
          {renderInput(
            props.addressNumber,
            props.setAddressNumber,
            "Número",
            colors,
            formStyles,
            "numeric",
            undefined,
            styles.numberInput
          )}
        </HStack>

        {renderInput(
          props.addressComplement,
          props.setAddressComplement,
          "Complemento",
          colors,
          formStyles
        )}
        {renderInput(
          props.addressDistrict,
          props.setAddressDistrict,
          "Bairro",
          colors,
          formStyles
        )}

        <HStack style={formStyles.row}>
          {renderInput(
            props.addressCity,
            props.setAddressCity,
            "Cidade",
            colors,
            formStyles,
            undefined,
            undefined,
            styles.cityInput
          )}

          <SelectInput
            options={BRAZILIAN_STATES.map((state) => ({
              label: state,
              value: state,
            }))}
            value={props.addressState}
            onChange={props.setAddressState}
            placeholder="Estado"
            containerStyle={[formStyles.input, styles.ufInput]}
            buttonStyle={formStyles.inputField}
          />
        </HStack>

        {renderInput(
          props.addressPostalCode,
          props.setAddressPostalCode,
          "CEP",
          colors,
          formStyles,
          "numeric"
        )}

        <TouchableOpacity
          onPress={() => props.setAllowsAdvertising(!props.allowsAdvertising)}
          style={styles.switchContainer}
        >
          <Box
            style={[
              styles.switch,
              {
                backgroundColor: props.allowsAdvertising
                  ? colors.switchActive
                  : colors.switchInactive,
              },
            ]}
          >
            <Box
              style={[
                styles.switchThumb,
                props.allowsAdvertising && styles.switchThumbActive,
              ]}
            />
          </Box>
          <Text style={[styles.switchText, { color: colors.textTertiary }]}>
            Permitir publicidade
          </Text>
        </TouchableOpacity>

        <Button
          onPress={handleSubmit}
          isDisabled={props.isSubmitting}
          style={[formStyles.button, { backgroundColor: colors.primary }]}
        >
          <ButtonText style={formStyles.buttonText}>
            {props.isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  messageBox: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  message: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-around",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  infoSection: {
    gap: 4,
  },
  dddInput: { width: 70 },
  phoneInput: { flex: 1 },
  streetInput: { flex: 2 },
  numberInput: { flex: 1 },
  cityInput: { flex: 1 },
  ufInput: { flex: 1,
    fontSize: 10,
   },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  switch: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: "center",
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  switchText: {
    fontSize: 15,
  },
});
