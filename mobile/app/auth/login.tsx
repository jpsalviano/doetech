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
import React, { useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, ScrollView } from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { useComponentColors } from "@/hooks/useComponentColors";
import { apiClient } from "@/api/apiClient";

// Contas de exemplo, quando a API está em modo demonstração.
type DemoInfo = {
  enabled: boolean;
  password?: string;
  resetsAt?: string;
  accounts?: { role: string; email: string }[];
};

export default function LoginScreen() {
  const auth = useContext(AuthContext);
  const login = auth?.login as (email: string, password: string) => Promise<void>;
  const router = useRouter();
  
  const { colors } = useComponentColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demo, setDemo] = useState<DemoInfo | null>(null);

  useEffect(() => {
    apiClient
      .get<DemoInfo>("/demo")
      .then((res) => setDemo(res.data.enabled ? res.data : null))
      .catch(() => setDemo(null));
  }, []);

  const validateEmail = (value: string) => {
    if (!value) return "Email é obrigatório!";
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Senha é obrigatória!";
    return "";
  };

  const handleLogin = async () => {
    setErrorMessage("");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrorMessage(emailError || passwordError);
      return;
    }

    if (!login) {
      setErrorMessage("Método de login não disponível.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/home');
    } catch (err: any) {
      const message =
        err?.response?.status === 401
          ? "Email ou senha inválidos"
          : err?.response?.data?.error || err?.response?.data?.message || "Não foi possível entrar. Tente de novo.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: colors.backgroundApp }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Box style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <VStack style={styles.vStack}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Heading style={[styles.heading, { color: colors.text }]}>
              Bem-vindo de volta
            </Heading>

            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
              Faça login para continuar
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

            <Input style={[styles.input, { backgroundColor: colors.inputBackground }]} isDisabled={isSubmitting}>
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                secureTextEntry
                style={[styles.inputField, { color: colors.text }]}
                placeholderTextColor={colors.placeholder}
              />
            </Input>

            {demo ? (
              <Box style={[styles.demoBox, { borderColor: colors.primary }]}>
                <Text style={[styles.demoTitle, { color: colors.text }]}>
                  Demonstração: entre com uma conta de exemplo
                </Text>
                <HStack style={styles.demoAccounts}>
                  {demo.accounts?.map((account) => (
                    <Button
                      key={account.email}
                      onPress={() => {
                        setEmail(account.email);
                        setPassword(demo.password ?? "");
                      }}
                      style={[styles.demoButton, { borderColor: colors.primary, backgroundColor: "transparent" }]}
                    >
                      <Text style={{ color: colors.primary }}>{account.role}</Text>
                    </Button>
                  ))}
                </HStack>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                  Senha: {demo.password}. Tudo volta ao estado inicial todo dia às {demo.resetsAt}.
                </Text>
              </Box>
            ) : null}

            <Button
              onPress={handleLogin}
              isDisabled={isSubmitting}
              style={[
                styles.button,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.buttonText}>{isSubmitting ? "Entrando..." : "Entrar"}</Text>
            </Button>

            <HStack style={styles.footer}>
              <Link onPress={() => router.push("/auth/recover")}>
                <Text style={[styles.linkAction, { color: colors.primary }]}> Recuperar senha</Text>
              </Link>
            </HStack>

            <HStack style={styles.footer}>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>Não tem conta?</Text>
              <Link onPress={() => router.push("/auth/register")}>
                <Text style={[styles.linkAction, { color: colors.primary }]}> Cadastre-se</Text>
              </Link>
            </HStack>

          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  demoBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  demoTitle: {
    fontWeight: "600",
  },
  demoAccounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  demoButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    width: "94%",
    maxWidth: 420,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    // sombra (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    // sombra (Android)
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
});