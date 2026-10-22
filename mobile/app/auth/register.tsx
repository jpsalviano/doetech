import SelectInput from "@/components/SelectInput";
import { useComponentColors } from "@/hooks/useComponentColors";
import { BRAZILIAN_STATES } from "@/utils/constants";
import { validateDate } from "@/utils/dateValidations";
import { applyCNPJMask, applyCPFMask, applyDateMask, removeMask } from "@/utils/masks";
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Input,
  InputField,
  Link,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { apiClient } from "../../api/apiClient";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useComponentColors();

  const [step, setStep] = useState<"user" | "account">("user");

  // Etapa 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Etapa 2
  const [personType, setPersonType] = useState<"fisica" | "juridica">("fisica");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [birthday, setBirthday] = useState(""); // Para pessoa física (data de nascimento)
  const [foundingDate, setFoundingDate] = useState(""); // Para pessoa jurídica (ata de fundação)
  const [phoneState, setPhoneState] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [role, setRole] = useState<"Donor" | "Receptor">("Donor");
  const [allowsAdvertising, setAllowsAdvertising] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const validateUserStep = () => {
    if (!email) return "Email é obrigatório";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Email inválido";
    if (!password) return "Senha é obrigatória";
    if (password.length < 6) return "Senha deve ter pelo menos 6 caracteres";
    if (password !== confirmPassword) return "As senhas não conferem";
    return "";
  };

  const validateAccountStep = () => {
    if (!name) return "Nome é obrigatório";
    
    // Validar de acordo com o tipo de pessoa
    if (personType === "fisica") {
      if (!cpf) return "CPF é obrigatório";
      const cpfDigits = removeMask(cpf);
      if (cpfDigits.length !== 11) return "CPF deve ter 11 dígitos";
      
      if (!birthday) return "Data de nascimento é obrigatória";
      const dateValidation = validateDate(birthday, { allowFuture: false, minAge: 18 });
      if (!dateValidation.valid) return dateValidation.error || "Data inválida";
    } else {
      if (!cnpj) return "CNPJ é obrigatório";
      const cnpjDigits = removeMask(cnpj);
      if (cnpjDigits.length !== 14) return "CNPJ deve ter 14 dígitos";
      
      if (!foundingDate) return "Ata de fundação é obrigatória";
      const dateValidation = validateDate(foundingDate, { allowFuture: false });
      if (!dateValidation.valid) return dateValidation.error || "Data inválida";
    }
    
    if (!phoneNumber) return "Telefone é obrigatório";
    if (!addressStreet) return "Rua é obrigatória";
    if (!addressNumber) return "Número é obrigatório";
    if (!addressCity) return "Cidade é obrigatória";
    if (!addressDistrict) return "Bairro é obrigatório";
    if (!addressState) return "Estado é obrigatório";
    if (!addressPostalCode) return "CEP é obrigatório";
    return "";
  };

  const handleNext = async () => {
    setErrorMessage("");
    const error = validateUserStep();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const userPayload = {
        email,
        password,
        isAdmin: false,
      };
      const userRes = await apiClient.post("/user", userPayload);
      setUserId(userRes.data.id);
      setStep("account");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao criar usuário";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    const error = validateAccountStep();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
   
    const birthdayConverted = (birthStr: string) => {
      const [day, month, year]: string[] = birthStr.split("/");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
    };

    try {
      const dateToUse = personType === "fisica" ? birthday : foundingDate;
      
      const accountPayload = {
        userId,
        ...(personType === "fisica" ? { name } : { businessName: name }),
        ...(personType === "fisica" ? { cpf: removeMask(cpf) } : { cnpj: removeMask(cnpj) }),
        birthdayDate: birthdayConverted(dateToUse),
        role,
        allowsAdvertising,
        active: true,
        phone: {
          countryCode: "55",
          stateCode: phoneState,
          phoneNumber: phoneNumber,
        },
        address: {
          street: addressStreet,
          number: addressNumber,
          city: addressCity,
          district: addressDistrict,
          state: addressState,
          complement: addressComplement,
          postalCode: addressPostalCode,
        },
      };

      await apiClient.post("/account", accountPayload);
      setSuccessMessage("Conta criada com sucesso!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Erro ao criar conta";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundApp },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Box
          style={[
            styles.card,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <VStack style={styles.vStack}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Heading
              style={[
                styles.heading,
                { color: colors.text },
              ]}
            >
              {step === "user" ? "Criar Conta" : "Dados Pessoais"}
            </Heading>

            <Text
              style={[
                styles.subTitle,
                { color: colors.textSecondary },
              ]}
            >
              {step === "user" ? "Etapa 1 de 2" : "Etapa 2 de 2"}
            </Text>

            {/* Breadcrumbs */}
            <HStack style={styles.breadcrumbs}>
              <Box
                style={[
                  styles.breadcrumb,
                  { backgroundColor: step === "user" ? colors.primary : colors.inactive },
                ]}
              />
              <Box
                style={[
                  styles.breadcrumb,
                  {
                    backgroundColor: step === "account" ? colors.primary : colors.inactive,
                  },
                ]}
              />
            </HStack>

            {/* Mensagens */}
            {errorMessage ? (
              <Box
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.infoBackground },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.error },
                  ]}
                >
                  {errorMessage}
                </Text>
              </Box>
            ) : null}

            {successMessage ? (
              <Box
                style={[
                  styles.successBox,
                  { backgroundColor: colors.infoBackground },
                ]}
              >
                <Text
                  style={[
                    styles.successText,
                    { color: colors.success },
                  ]}
                >
                  {successMessage}
                </Text>
              </Box>
            ) : null}

            {/* Etapa 1 */}
            {step === "user" && (
              <VStack style={styles.formStack}>
                <Input
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground },
                  ]}
                  isDisabled={isSubmitting}
                >
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[
                      styles.inputField,
                      { color: colors.text },
                    ]}
                    placeholderTextColor={colors.placeholder}
                  />
                </Input>

                <Input
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground },
                  ]}
                  isDisabled={isSubmitting}
                >
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    secureTextEntry
                    style={[
                      styles.inputField,
                      { color: colors.text },
                    ]}
                    placeholderTextColor={colors.placeholder}
                  />
                </Input>

                <Input
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground },
                  ]}
                  isDisabled={isSubmitting}
                >
                  <InputField
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmar Senha"
                    secureTextEntry
                    style={[
                      styles.inputField,
                      { color: colors.text },
                    ]}
                    placeholderTextColor={colors.placeholder}
                  />
                </Input>

                <Button
                  onPress={handleNext}
                  isDisabled={isSubmitting}
                  style={[
                    styles.button,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>
                    {isSubmitting ? "Criando usuário..." : "Próximo"}
                  </Text>
                </Button>

                <HStack style={styles.footer}>
                  <Text
                    style={[
                      styles.hint,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Já tem conta?
                  </Text>
                  <Link onPress={() => router.push("/auth/login")}>
                    <Text
                      style={[
                        styles.linkAction,
                        { color: colors.primary },
                      ]}
                    >
                      {" "}
                      Faça login
                    </Text>
                  </Link>
                </HStack>
              </VStack>
            )}

            {/* Etapa 2 */}
            {step === "account" && (
              <VStack style={styles.formStack}>
                <Input
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground },
                  ]}
                  isDisabled={isSubmitting}
                >
                  <InputField
                    value={name}
                    onChangeText={setName}
                    placeholder="Nome completo"
                    style={[
                      styles.inputField,
                      { color: colors.text },
                    ]}
                    placeholderTextColor={colors.placeholder}
                  />
                </Input>

                {/* Person Type Radio Buttons */}
                <VStack style={styles.radioSection}>
                  <Text
                    style={[
                      styles.label,
                      { color: colors.text },
                    ]}
                  >
                    Tipo de pessoa:
                  </Text>
                  <HStack style={styles.radioContainer}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => {
                        setPersonType("fisica");
                        setCnpj("");
                        setFoundingDate("");
                      }}
                      disabled={isSubmitting}
                    >
                      <Box
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                        ]}
                      >
                        {personType === "fisica" && <Box style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                      </Box>
                      <Text
                        style={[
                          styles.radioText,
                          { color: colors.text },
                        ]}
                      >
                        Física
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => {
                        setPersonType("juridica");
                        setCpf("");
                        setBirthday("");
                      }}
                      disabled={isSubmitting}
                    >
                      <Box
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                        ]}
                      >
                        {personType === "juridica" && (
                          <Box style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                        )}
                      </Box>
                      <Text
                        style={[
                          styles.radioText,
                          { color: colors.text },
                        ]}
                      >
                        Jurídica
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </VStack>

                {/* CPF/CNPJ and Birth Date/Founding Date based on person type */}
                {personType === "fisica" ? (
                  <>
                    <Input
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground },
                      ]}
                      isDisabled={isSubmitting}
                    >
                      <InputField
                        value={cpf}
                        onChangeText={(val) => setCpf(applyCPFMask(val))}
                        placeholder="CPF"
                        keyboardType="numeric"
                        maxLength={14}
                        style={[
                          styles.inputField,
                          { color: colors.text },
                        ]}
                        placeholderTextColor={colors.placeholder}
                      />
                    </Input>

                    <Input
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground },
                      ]}
                      isDisabled={isSubmitting}
                    >
                      <InputField
                        value={birthday}
                        onChangeText={(val) => setBirthday(applyDateMask(val))}
                        placeholder="Data de nascimento (DD/MM/AAAA)"
                        keyboardType="numeric"
                        maxLength={10}
                        style={[
                          styles.inputField,
                          { color: colors.text },
                        ]}
                        placeholderTextColor={colors.placeholder}
                      />
                    </Input>
                  </>
                ) : (
                  <>
                    <Input
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground },
                      ]}
                      isDisabled={isSubmitting}
                    >
                      <InputField
                        value={cnpj}
                        onChangeText={(val) => setCnpj(applyCNPJMask(val))}
                        placeholder="CNPJ"
                        keyboardType="numeric"
                        maxLength={18}
                        style={[
                          styles.inputField,
                          { color: colors.text },
                        ]}
                        placeholderTextColor={colors.placeholder}
                      />
                    </Input>

                    <Input
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground },
                      ]}
                      isDisabled={isSubmitting}
                    >
                      <InputField
                        value={foundingDate}
                        onChangeText={(val) => setFoundingDate(applyDateMask(val))}
                        placeholder="Ata de fundação (DD/MM/AAAA)"
                        keyboardType="numeric"
                        maxLength={10}
                        style={[
                          styles.inputField,
                          { color: colors.text },
                        ]}
                        placeholderTextColor={colors.placeholder}
                      />
                    </Input>
                  </>
                )}

                <HStack style={styles.rowInputs}>
                  <Input
                    style={[
                      styles.input,
                      styles.halfInput,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    isDisabled={isSubmitting}
                  >
                    <InputField
                      value={phoneState}
                      onChangeText={setPhoneState}
                      placeholder="DDD"
                      keyboardType="numeric"
                      style={[
                        styles.inputField,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  </Input>
                  <Input
                    style={[
                      styles.input,
                      styles.halfInput,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    isDisabled={isSubmitting}
                  >
                    <InputField
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Telefone"
                      keyboardType="numeric"
                      style={[
                        styles.inputField,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  </Input>
                </HStack>

                <Input
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground },
                  ]}
                  isDisabled={isSubmitting}
                >
                  <InputField
                    value={addressStreet}
                    onChangeText={setAddressStreet}
                    placeholder="Rua"
                    style={[
                      styles.inputField,
                      { color: colors.text },
                    ]}
                    placeholderTextColor={colors.placeholder}
                  />
                </Input>

                <HStack style={styles.rowInputs}>
                  <Input
                    style={[
                      styles.input,
                      styles.halfInput,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    isDisabled={isSubmitting}
                  >
                    <InputField
                      value={addressNumber}
                      onChangeText={setAddressNumber}
                      placeholder="Número"
                      keyboardType="numeric"
                      style={[
                        styles.inputField,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  </Input>
                  <Input
                    style={[
                      styles.input,
                      styles.halfInput,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    isDisabled={isSubmitting}
                  >
                    <InputField
                      value={addressComplement}
                      onChangeText={setAddressComplement}
                      placeholder="Complemento"
                      style={[
                        styles.inputField,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  </Input>
                </HStack>

                <Input
                  style={[
                    styles.input,
                    { backgroundColor: colors.inputBackground },
                  ]}
                  isDisabled={isSubmitting}
                >
                  <InputField
                    value={addressDistrict}
                    onChangeText={setAddressDistrict}
                    placeholder="Bairro"
                    style={[
                      styles.inputField,
                      { color: colors.text },
                    ]}
                    placeholderTextColor={colors.placeholder}
                  />
                </Input>

                <HStack style={styles.rowInputs}>
                  <Input
                    style={[
                      styles.input,
                      styles.halfInput,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    isDisabled={isSubmitting}
                  >
                    <InputField
                      value={addressCity}
                      onChangeText={setAddressCity}
                      placeholder="Cidade"
                      style={[
                        styles.inputField,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  </Input>
                  <SelectInput
                    options={BRAZILIAN_STATES.map(state => ({ label: state, value: state }))}
                    value={addressState}
                    onChange={setAddressState}
                    placeholder="UF"
                    isDisabled={isSubmitting}
                    containerStyle={styles.quarterInput}
                    buttonStyle={[
                      styles.input,
                      styles.selectButton,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    modalStyle={{ backgroundColor: colors.surface }}
                  />

                </HStack>

                  <Input
                    style={[
                      styles.input,
                      { backgroundColor: colors.inputBackground },
                    ]}
                    isDisabled={isSubmitting}
                  >
                    <InputField
                      value={addressPostalCode}
                      onChangeText={setAddressPostalCode}
                      placeholder="CEP"
                      keyboardType="numeric"
                      style={[
                        styles.inputField,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  </Input>

                {/* Radio Buttons */}
                <VStack style={styles.radioSection}>
                  <Text
                    style={[
                      styles.label,
                      { color: colors.text },
                    ]}
                  >
                    Tipo de conta:
                  </Text>
                  <HStack style={styles.radioContainer}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setRole("Donor")}
                      disabled={isSubmitting}
                    >
                      <Box
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                        ]}
                      >
                        {role === "Donor" && <Box style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                      </Box>
                      <Text
                        style={[
                          styles.radioText,
                          { color: colors.text },
                        ]}
                      >
                        Doador
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setRole("Receptor")}
                      disabled={isSubmitting}
                    >
                      <Box
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.border },
                        ]}
                      >
                        {role === "Receptor" && (
                          <Box style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                        )}
                      </Box>
                      <Text
                        style={[
                          styles.radioText,
                          { color: colors.text },
                        ]}
                      >
                        Receptor
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                </VStack>

                {/* Switch */}
                <TouchableOpacity
                  style={styles.switchContainer}
                  onPress={() => setAllowsAdvertising(!allowsAdvertising)}
                  disabled={isSubmitting}
                >
                  <Box
                    style={[
                      styles.switch,
                      {
                        backgroundColor: allowsAdvertising
                          ? colors.primary
                          : colors.inactive,
                      },
                    ]}
                  >
                    <Box
                      style={[
                        styles.switchThumb,
                        { backgroundColor: colors.fabBackground },
                        allowsAdvertising && styles.switchThumbActive,
                      ]}
                    />
                  </Box>
                  <Text
                    style={[
                      styles.switchText,
                      { color: colors.text },
                    ]}
                  >
                    Permitir publicidade
                  </Text>
                </TouchableOpacity>

                <Button
                  onPress={handleCreateAccount}
                  isDisabled={isSubmitting}
                  style={[
                    styles.button,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.buttonText, { color: colors.textOnPrimary }]}>
                    {isSubmitting ? "Criando conta..." : "Criar Conta"}
                  </Text>
                </Button>
              </VStack>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    width: "94%",
    maxWidth: 420,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  vStack: {
    gap: 12,
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 84,
    height: 84,
    marginBottom: 4,
    alignSelf: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  breadcrumbs: {
    width: "100%",
    gap: 8,
    marginBottom: 8,
  },
  breadcrumb: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  errorBox: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  errorText: {
    textAlign: "center",
    fontSize: 13,
  },
  successBox: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  successText: {
    textAlign: "center",
    fontSize: 13,
  },
  formStack: {
    width: "100%",
    gap: 12,
  },
  input: {
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputField: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    width: "100%",
  },
  rowInputs: {
    width: "100%",
    gap: 8,
    flexDirection: "row",
  },
  halfInput: {
    flex: 1,
  },
  dddInput: {
    width: 80,
  },
  phoneInput: {
    flex: 1,
  },
  cityInput: {
    flex: 1,
  },
  ufInput: {
    width: 65,
  },
  cepInput: {
    flex: 1,
  },
  quarterInput: {
    width: "24%",
  },
  selectButton: {
    justifyContent: "center",
    paddingHorizontal: 16,
    minHeight: 48,
  },
  radioSection: {
    width: "100%",
    marginTop: 8,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  radioContainer: {
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 15,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
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
    // backgroundColor será definido dinamicamente com fabBackground
    transform: [{ translateX: 0 }],
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  switchText: {
    fontSize: 15,
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    marginTop: 6,
    alignItems: "center",
  },
  hint: {
    fontSize: 13,
  },
  linkAction: {
    fontSize: 13,
    fontWeight: "700",
  },
});
