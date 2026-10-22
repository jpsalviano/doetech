import { apiClient } from "@/api/apiClient";
import { useCart } from "@/contexts/CartContext";
import { Account, useUserProfile } from "@/contexts/UserProfileContext";
import { useComponentColors } from "@/hooks/useComponentColors";
import { useScreenTitle } from "@/hooks/useScreenTitle";
import { Box, Button, ButtonText, Heading, Text } from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
interface Equipment {
  id?: string;
  donorAccountId?: string;
  description?: string;
  type?: EquipmentType;
  status?: string;
  avaiabilityDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

enum EquipmentType {
  Desktop = "Computador",
  SmartPhone = "Smartphone",
  Tablet = "Tablet",
  Notebook = "Notebook",
  Peripherals = "Periféricos",
}

type Status = "Available" | "Finished" | "Canceled" | "OnGoing" | "InProgress";

export default function EquipmentDetailsScreen() {
  const { equipmentId } = useLocalSearchParams();

  const { account } = useUserProfile();
  const { colors, formStyles } = useComponentColors();
  const { addToCart } = useCart();

  const [message, setMessage] = useState("");

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [donorAccountData, setDonorAccountData] = useState<Account | null>(
    null
  );

  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showModal, fadeAnim, slideAnim]);

  function translateStatus(status: Status): string {
    const map: Record<Status, string> = {
      Available: "Disponível",
      Finished: "Finalizado",
      Canceled: "Cancelado",
      OnGoing: "Em andamento",
      InProgress: "Em progresso",
    };

    return map[status];
  }

  useEffect(() => {
    const loadEquipment = async () => {
      const equipment = await apiClient
        .get(`/equipment/${equipmentId}`)
        .then((res) => res.data);
      setEquipment(equipment);
    };
    loadEquipment();
  }, [equipmentId]);

  useEffect(() => {
    const loadDonorAccountData = async () => {
      if (!equipment?.donorAccountId) return;

      const donorData = await apiClient
        .get(`/account/${equipment.donorAccountId}`)
        .then((res) => res.data)
        .catch((err) => console.error("Error loading donor account:", err));

      setDonorAccountData(donorData);
    };

    loadDonorAccountData();
  }, [equipment]);

  useScreenTitle(`${equipment?.description}`);

  const handleCreateDonation = (accountId: string, equipmentId: string) => {
    try {
      apiClient
        .post("/donation", {
          recipientAccountId: accountId,
          equipmentIds: [equipmentId],
        })
        .then((res) => {
          if (res.status === 200) {
            router.push("/equipments");
            setShowModal(!showModal);
          }
        })
        .catch((err) => {
          console.error(err);
          setShowModal(!showModal);

          setMessage("Equipamento já está em processo de doação.");
        });
    } catch (err) {
      console.error(err);
    }
  };

  if (!equipment) {
    return (
      <View style={styles.container}>
        <Text>Carregando detalhes do equipamento...</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.centeredView, { backgroundColor: colors.background }]}
        >
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Box
                style={[
                  styles.detailsContainer,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Heading style={[styles.title, { color: colors.text }]}>
                  {equipment.description}
                </Heading>

                <Text style={[styles.text, { color: colors.text }]}>
                  <Text style={styles.textBold}>Tipo:</Text>

                  {" " + EquipmentType[equipment.type as unknown as keyof typeof EquipmentType]}
                </Text>

                <Text style={[styles.text, { color: colors.text }]}>
                  <Text style={styles.textBold}>Data de disponibilização:</Text>
                  {" " +
                    new Date(
                      Number(equipment.avaiabilityDate)
                    ).toLocaleDateString()}
                </Text>
                <Text style={[styles.text, { color: colors.text }]}>
                  <Text style={styles.textBold}>Status:</Text>
                  {" " + translateStatus(equipment.status as Status)}
                </Text>
                <Text style={[styles.text, { color: colors.text }]}>
                  <Text style={styles.textBold}>Doador:</Text>{" "}
                  {!!donorAccountData?.name
                    ? donorAccountData?.name
                    : donorAccountData?.businessName}
                </Text>
                <Text style={[styles.text, { color: colors.text }]}>
                  <Text style={styles.textBold}>Localização:</Text>
                  {" " + account?.address.city}
                </Text>
                <Text style={[styles.text, { color: colors.text }]}>
                  <Text style={styles.textBold}>Última atualização:</Text>
                  {" " +
                    new Date(Number(equipment.updatedAt)).toLocaleDateString()}
                </Text>
              </Box>
            </ScrollView>

            <View
              style={[
                styles.buttonContainer,
                {
                  borderTopColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              {message !== "" ? (
                <Text
                  style={[
                    styles.text,
                    {
                      color: colors.error,
                      textAlign: "center",
                      marginBottom: 0,
                    },
                  ]}
                >
                  {message}
                </Text>
              ) : null}
              {account?.role !== "Donor" ? (
                <Button
                  style={[
                    formStyles.button,
                    {
                      backgroundColor:
                        equipment.status !== "Available"
                          ? colors.inactive
                          : colors.primary,
                    },
                  ]}
                  disabled={equipment.status !== "Available"}
                  onPress={() => {
                    setShowModal(true);
                  }}
                >
                  <ButtonText style={formStyles.buttonText}>
                    Quero esse {equipment.type}
                  </ButtonText>
                </Button>
              ) : (
                <Button
                  style={[
                    formStyles.button,
                    { backgroundColor: colors.warning },
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: "/equipments/create",
                      params: { equipmentId: equipment.id },
                    });
                  }}
                >
                  <ButtonText style={formStyles.buttonText}>Editar</ButtonText>
                </Button>
              )}
            </View>

            <Modal
              transparent={true}
              visible={showModal}
              onRequestClose={() => {
                setShowModal(!showModal);
              }}
            >
              <Animated.View
                style={[styles.modalOverlay, { opacity: fadeAnim }]}
              >
                <Pressable
                  style={styles.centeredView}
                  onPress={() => setShowModal(false)}
                >
                  <Animated.View
                    style={[
                      styles.modalView,
                      {
                        transform: [{ translateY: slideAnim }],
                        backgroundColor: colors.backgroundSecondary,
                        shadowColor: colors.shadow,
                      },
                    ]}
                  >
                    <Pressable
                      style={styles.modalContent}
                      onPress={(e) => e.stopPropagation()}
                    >
                      <Text style={[styles.modalText, { color: colors.text }]}>
                        Deseja finalizar a solicitação?
                      </Text>
                      <View style={styles.modalButtonsContainer}>
                        {/* This Pressable has to be a "add more" button, for the shop cart functionality */}
                        <Pressable
                          style={[
                            formStyles.button,
                            styles.modalButton,
                            {
                              backgroundColor: colors.info,
                            },
                          ]}
                          onPress={() => {
                            addToCart(equipment.id!);

                            setShowModal(!showModal);
                          }}
                        >
                          <Text
                            style={[styles.textStyle, formStyles.buttonText]}
                          >
                            Adicionar Mais
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[
                            formStyles.button,
                            styles.modalButton,
                            { backgroundColor: colors.success },
                          ]}
                          onPress={() =>
                            handleCreateDonation(account!.id, equipment.id!)
                          }
                        >
                          <Text
                            style={[styles.textStyle, formStyles.buttonText]}
                          >
                            Finalizar
                          </Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  </Animated.View>
                </Pressable>
              </Animated.View>
            </Modal>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    borderRadius: 12,
    padding: 35,
    width: "95%",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
  },
  textStyle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    flex: 1,
  },
  detailsContainer: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  textBold: {
    fontWeight: "bold",
  },
  buttonContainer: {
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  flexButton: {
    flex: 1,
    marginTop: 0,
  },
});
