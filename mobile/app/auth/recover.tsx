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
  VStack
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { apiClient } from "../../api/apiClient";
import { AuthContext } from "../../contexts/AuthContext";
import { useComponentColors } from "@/hooks/useComponentColors";

export default function RecoverScreen() {
  const auth = useContext(AuthContext);
  const login = auth?.login as (email: string, password: string) => Promise<void>;
  const router = useRouter();
  const { colors } = useComponentColors();

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return "Email é obrigatório";
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return "";
  };

  const handleRecover = async () => {
    setErrorMessage("");
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    if (!login) {
      setErrorMessage("Recuperação de senha não disponível.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recoverPayload = { email: email };
      await apiClient.post("/user/recover", recoverPayload);
      setShowSuccessModal(true);
      setEmail("");
    } catch (err: any) {
      const status = err?.response?.status;
      let message = err?.response?.data?.message || err?.message || "Email inválido";
      
      if (status === 404) {
        message = "Não existe uma conta registrada com este email. Verifique o email ou cadastre-se.";
      }
      
      setModalErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/auth/login");
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.backgroundApp }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Box style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <VStack style={styles.vStack}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Heading style={[styles.heading, { color: colors.text }]}>
            Recuperação de senha
          </Heading>

          <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
            Vamos te ajudar a recuperar sua senha.
          </Text>

          <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
            Insira seu email abaixo para começar.
          </Text>

          {errorMessage ? (
            <Box style={[styles.errorBox, { backgroundColor: colors.infoBackground }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errorMessage}
              </Text>
            </Box>
          ) : null}

          <Input style={[styles.input, { backgroundColor: colors.inputBackground }]} isDisabled={isSubmitting}>
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.inputField, { color: colors.text }]}
              placeholderTextColor={colors.placeholder}
            />
          </Input>

          <Button
            onPress={handleRecover}
            isDisabled={isSubmitting}
            style={[
              styles.button,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.buttonText}>{isSubmitting ? "Enviando email..." : "Continuar"}</Text>
          </Button>

          <HStack style={styles.footer}>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>Não tem conta?</Text>
            <Link onPress={() => router.push("/auth/register")}>
              <Text style={[styles.linkAction, { color: colors.primary }]}> Cadastre-se</Text>
            </Link>
          </HStack>
        </VStack>
      </Box>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <Box style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
          <Box style={[styles.cardModal, { backgroundColor: colors.cardBackground }]}>
            <Box style={[styles.successGradient, { backgroundColor: colors.success }]}>
              <Text style={styles.iconLarge}>✓</Text>
            </Box>

            <VStack style={styles.modalContent}>
              <Heading style={[styles.modalTitle, { color: colors.text }]}>
                Perfeito!
              </Heading>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Verifique seu email.
              </Text>

              <Box style={[styles.messageBox, { backgroundColor: colors.infoBackground, borderColor: colors.infoBorder }]}>
                <Text style={[styles.messageText, { color: colors.infoText }]}>
                  Enviamos um email com instruções para recuperar sua senha. Verifique sua caixa de entrada e a pasta de spam.
                </Text>
              </Box>

              <Button
                onPress={handleSuccessClose}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.success },
                ]}
              >
                <Text style={styles.buttonText}>Voltar ao login</Text>
              </Button>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Modal de erro */}
      {showErrorModal && (
        <Box style={[styles.modalOverlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
          <Box style={[styles.cardModal, { backgroundColor: colors.cardBackground }]}>
            <Box style={[styles.errorGradient, { backgroundColor: colors.error }]}>
              <Text style={styles.iconLarge}>!</Text>
            </Box>

            <VStack style={styles.modalContent}>
              <Heading style={[styles.modalTitle, { color: colors.error }]}>
                Kernel Panic!
              </Heading>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Algo deu errado ao tentar recuperar sua senha.
              </Text>

              <Box style={[styles.messageBox, { backgroundColor: colors.errorBackground, borderColor: colors.errorBorder }]}>
                <Text style={[styles.messageText, { color: colors.error }]}>
                  {modalErrorMessage}
                </Text>
              </Box>

              <Button
                onPress={handleErrorClose}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.error },
                ]}
              >
                <Text style={styles.buttonText}>Tentar novamente</Text>
              </Button>
            </VStack>
          </Box>
        </Box>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
  input: {
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "transparent",
    marginTop: 8,
  },
  inputField: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    width: "100%",
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
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
  // Estilos da Modal
  backdrop: {
    position: "absolute",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cardModal: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  successGradient: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  errorGradient: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLarge: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
  },
  messageBox: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginVertical: 12,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  primaryButton: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});