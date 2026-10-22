import { apiClient } from "@/api/apiClient";
import { useComponentColors } from "@/hooks/useComponentColors";
import { useScreenTitle } from "@/hooks/useScreenTitle";
import {
  Box,
  Button,
  ButtonText,
  Heading,
  Text,
  Pressable,
} from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUserProfile } from "@/contexts/UserProfileContext";

interface Equipment {
  id: string;
  description: string;
  type: string;
  status: EquipmentStatus;
  donorAccountId: string;
  avaiabilityDate: number;
  createdAt: number;
}

enum EquipmentStatus {
    Available = 'Disponível',
    Finished = 'Processamento finalizado',
    Cancelado = 'Cancelado/indisponível',
    OnGoing = 'Processando envio',
    InProgress = 'Em progresso/processamento',
}

interface DonationEquipment {
  id: string;
  donationId: string;
  equipmentId: string;
}

interface Donation {
  id: string;
  recipientAccountId: string;
  equipments: DonationEquipment[];
  status: string;
  removed: boolean;
  createdAt: number;
  updatedAt: number;
  finishedAt?: number;
}

interface AccountAddress {
  street: string;
  number: string;
  city: string;
  district: string;
  state: string;
  complement?: string;
  postalCode: string;
}

interface AccountPhone {
  countryCode: string;
  stateCode: string;
  phoneNumber: string;
}

interface RecipientAccount {
  id: string;
  name?: string;
  businessName?: string;
  address: AccountAddress;
  phone: AccountPhone;
}

export default function DonationDetailsScreen() {
  useScreenTitle("Detalhes da Doação");
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, formStyles } = useComponentColors();
  const { account } = useUserProfile();
  const router = useRouter();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [recipientAccount, setRecipientAccount] =
    useState<RecipientAccount | null>(null);
  const [expandedEquipments, setExpandedEquipments] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "cancel" | null
  >(null);

  useEffect(() => {
    if (!id) return;

    const fetchDonationDetails = async () => {
      try {
        setLoading(true);

        // Buscar doação
        const donationResponse = await apiClient.get(`/donation/${id}`);
        const donationData = donationResponse.data;
        setDonation(donationData);

        // Buscar detalhes de cada equipamento
        if (donationData.equipments && donationData.equipments.length > 0) {
          const equipmentPromises = donationData.equipments.map(
            (de: DonationEquipment) =>
              apiClient
                .get(`/equipment/${de.equipmentId}`)
                .then((res) => res.data)
          );

          const equipmentsData = await Promise.all(equipmentPromises);
          setEquipments(equipmentsData);
        }

        // Buscar conta do receptor
        if (donationData.recipientAccountId) {
          const recipientResponse = await apiClient.get(
            `/account/${donationData.recipientAccountId}`
          );
          setRecipientAccount(recipientResponse.data);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError("Erro ao buscar detalhes da doação.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [id]);

  const updateDonationStatus = async (status: "Approved" | "Canceled") => {
    if (!donation) return;

    try {
      setIsUpdatingStatus(true);
      setShowConfirmModal(false);

      await apiClient.put(`/donation/${donation.id}/status`, `"${status}"`, {
        headers: { "Content-Type": "application/json" },
      });

      // Atualizar estado local
      setDonation({ ...donation, status });

      // Mostrar mensagem de sucesso
      Alert.alert(
        "Sucesso!",
        `Doação ${
          status === "Approved" ? "aprovada" : "recusada"
        } com sucesso!`,
        [{ text: "OK" }]
      );
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);
      Alert.alert(
        "Erro",
        err?.response?.data?.message ||
          "Não foi possível atualizar o status da doação.",
        [{ text: "OK" }]
      );
    } finally {
      setIsUpdatingStatus(false);
      setConfirmAction(null);
    }
  };

  const handleApprove = () => {
    setConfirmAction("approve");
    setShowConfirmModal(true);
  };

  const handleCancel = () => {
    setConfirmAction("cancel");
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === "approve") {
      updateDonationStatus("Approved");
    } else if (confirmAction === "cancel") {
      updateDonationStatus("Canceled");
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const toggleEquipment = (equipmentId: string) => {
    setExpandedEquipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(equipmentId)) {
        newSet.delete(equipmentId);
      } else {
        newSet.add(equipmentId);
      }
      return newSet;
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      Pending: "Pendente",
      Approved: "Aprovada",
      InProgress: "Em Andamento",
      Completed: "Concluída",
      Canceled: "Cancelada",
      Finished: "Finalizada",
    };
    return statusMap[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      Desktop: "Desktop",
      SmartPhone: "Smartphone",
      Tablet: "Tablet",
      Notebook: "Notebook",
      Peripherals: "Periféricos",
    };
    return typeMap[type] || type;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "---";
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: AccountAddress) => {
    const complement = address.complement ? `, ${address.complement}` : "";
    return `${address.street}, ${address.number}${complement}\n${address.district} - ${address.city}, ${address.state}\nCEP: ${address.postalCode}`;
  };

  const formatPhone = (phone: AccountPhone) => {
    return `(${phone.stateCode}) ${phone.phoneNumber}`;
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: colors.backgroundApp },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !donation) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: colors.backgroundApp },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || "Doação não encontrada."}
        </Text>
      </View>
    );
  }

  const showActionButtons =
    account?.role === "Donor" && donation.status === "Pending";

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundApp }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Box
          style={[
            styles.detailsContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Status */}
          <Box
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  donation.status === "Completed" ||
                  donation.status === "Approved"
                    ? colors.success
                    : donation.status === "Canceled"
                    ? colors.error
                    : colors.warning,
              },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {getStatusLabel(donation.status)}
            </Text>
          </Box>

          {/* Informações principais */}
          <Box style={styles.infoSection}>
            <Text style={[styles.detailItem, { color: colors.text }]}>
              <Text style={styles.detailLabel}>Identificador da doação:</Text>{" "}
              {donation.id}
            </Text>
            <Text style={[styles.detailItem, { color: colors.text }]}>
              <Text style={styles.detailLabel}>Data da criação:</Text>{" "}
              {formatDate(donation.createdAt)}
            </Text>
            <Text style={[styles.detailItem, { color: colors.text }]}>
              <Text style={styles.detailLabel}>Última atualização:</Text>{" "}
              {formatDate(donation.updatedAt)}
            </Text>
            <Text style={[styles.detailItem, { color: colors.text }]}>
              <Text style={styles.detailLabel}>Data de conclusão:</Text>{" "}
              {donation.finishedAt && donation.finishedAt > 0
                ? formatDate(donation.finishedAt)
                : "Em processamento"}
            </Text>
          </Box>

          {/* Lista de equipamentos */}
          <Heading style={[styles.sectionTitle, { color: colors.text }]}>
            Equipamentos ({equipments.length})
          </Heading>

          {equipments.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum equipamento vinculado.
            </Text>
          ) : (
            equipments.map((equipment, idx) => (
              <Box
                key={equipment.id}
                style={[
                  styles.equipmentCard,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Pressable
                  onPress={() => toggleEquipment(equipment.id)}
                  style={styles.equipmentHeader}
                >
                  <Box style={styles.equipmentHeaderContent}>
                    <Text
                      style={[styles.equipmentTitle, { color: colors.text }]}
                    >
                      Equipamento {idx + 1}
                    </Text>
                    <Text
                      style={[
                        styles.equipmentType,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {getTypeLabel(equipment.type)}
                    </Text>
                  </Box>
                  <MaterialIcons
                    name={
                      expandedEquipments.has(equipment.id)
                        ? "expand-less"
                        : "expand-more"
                    }
                    size={24}
                    color={colors.text}
                  />
                </Pressable>

                {expandedEquipments.has(equipment.id) && (
                  <Box
                    style={[
                      styles.equipmentDetails,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.equipmentDetailItem,
                        { color: colors.text },
                      ]}
                    >
                      <Text style={styles.detailLabel}>Descrição:</Text>{" "}
                      {equipment.description}
                    </Text>
                    <Text
                      style={[
                        styles.equipmentDetailItem,
                        { color: colors.text },
                      ]}
                    >
                      <Text style={styles.detailLabel}>Status:</Text>{" "}
                      {EquipmentStatus[equipment.status as unknown as keyof typeof EquipmentStatus]}
                    </Text>
                    <Text
                      style={[
                        styles.equipmentDetailItem,
                        { color: colors.text },
                      ]}
                    >
                      <Text style={styles.detailLabel}>
                        Data de disponibilidade:
                      </Text>{" "}
                      {formatDate(equipment.avaiabilityDate)}
                    </Text>
                  </Box>
                )}
              </Box>
            ))
          )}

          {/* Informações do receptor para entrega */}
          {recipientAccount && (
            <>
              <Heading style={[styles.sectionTitle, { color: colors.text }]}>
                Informações de envio
              </Heading>

              <Box
                style={[
                  styles.recipientCard,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Box style={styles.recipientSection}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.recipientLabel, { color: colors.text }]}>
                    Destinatário
                  </Text>
                </Box>
                <Text
                  style={[
                    styles.recipientText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {recipientAccount.businessName ||
                    recipientAccount.name ||
                    "Não informado"}
                </Text>

                <Box style={[styles.recipientSection, { marginTop: 12 }]}>
                  <MaterialIcons
                    name="location-on"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.recipientLabel, { color: colors.text }]}>
                    Endereço
                  </Text>
                </Box>
                <Text
                  style={[
                    styles.recipientText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatAddress(recipientAccount.address)}
                </Text>

                <Box style={[styles.recipientSection, { marginTop: 12 }]}>
                  <MaterialIcons
                    name="phone"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.recipientLabel, { color: colors.text }]}>
                    Telefone de contato
                  </Text>
                </Box>
                <Text
                  style={[
                    styles.recipientText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatPhone(recipientAccount.phone)}
                </Text>
              </Box>
            </>
          )}
        </Box>
      </ScrollView>

      {/* Botões de ação - apenas para doadores com doação pendente */}
      {showActionButtons && (
        <View
          style={[
            styles.buttonContainer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
        >
          <View style={styles.actionButtonsRow}>
            <Button
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={handleApprove}
              isDisabled={isUpdatingStatus}
            >
              <ButtonText style={styles.buttonText}>
                {isUpdatingStatus ? "Aguarde..." : "Aceitar doação"}
              </ButtonText>
            </Button>

            <Button
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={handleCancel}
              isDisabled={isUpdatingStatus}
            >
              <ButtonText style={styles.buttonText}>Recusar</ButtonText>
            </Button>
          </View>
        </View>
      )}

      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[styles.cardModal, { backgroundColor: colors.background }]}
          >
            {/* Cabeçalho com cor baseada na ação */}
            <View
              style={[
                styles.modalHeader,
                {
                  backgroundColor:
                    confirmAction === "approve" ? colors.success : colors.error,
                },
              ]}
            >
              <MaterialIcons
                name={confirmAction === "approve" ? "check-circle" : "cancel"}
                style={styles.modalHeaderIcon}
              />
            </View>

            {/* Conteúdo */}
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {confirmAction === "approve"
                  ? "Confirmar aprovação?"
                  : "Confirmar recusa?"}
              </Text>

              <Text
                style={[styles.modalSubtitle, { color: colors.textSecondary }]}
              >
                {confirmAction === "approve"
                  ? "Você confirma que deseja aprovar esta doação?"
                  : "Você confirma que deseja recusar esta doação?"}
              </Text>

              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleConfirmAction}
                  disabled={isUpdatingStatus}
                >
                  <Text style={styles.modalButtonText}>
                    {isUpdatingStatus ? "Aguarde..." : "Confirmar"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.textSecondary },
                  ]}
                  onPress={handleCloseModal}
                  disabled={isUpdatingStatus}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  detailsContainer: {
    padding: 20,
    borderRadius: 12,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 24,
  },
  detailItem: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
  },
  detailLabel: {
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  equipmentCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  equipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  equipmentHeaderContent: {
    flex: 1,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
  },
  equipmentDetails: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  equipmentDetailItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  recipientCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  recipientSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  recipientLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  recipientText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  cardModal: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderIcon: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
