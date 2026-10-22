import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Heading, Box, Text, VStack, Button } from "@gluestack-ui/themed";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Modal, ScrollView, TouchableOpacity } from "react-native";
import { useComponentColors } from "../hooks/useComponentColors";
import { useUserProfile } from "../contexts/UserProfileContext";
import { apiClient } from "../api/apiClient";

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  accountId: string;
  read: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function Header({ title = "DoeTech", onMenuPress, onNotificationsPress }: HeaderProps) {
  const { colors } = useComponentColors();
  const { account, loading } = useUserProfile();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!account?.id) return;
    
    setIsLoadingNotifications(true);
    try {
      const response = await apiClient.get(`/notification/${account.id}/all`);
      // Ordenar por data decrescente (mais recentes primeiro)
      const sortedNotifications = response.data.sort((a: Notification, b: Notification) => 
        b.createdAt - a.createdAt
      );
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.post(`/notification/${notificationId}`);
      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  useEffect(() => {
    if (account?.id) {
      fetchNotifications();
      // Atualizar notificações a cada 30 segundos (pooling). Menos do que isso pode ferrar o backend
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [account?.id]);

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
  };

  const handleNotificationsPress = () => {
    setShowDropdown(!showDropdown);
    if (onNotificationsPress) {
      onNotificationsPress();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    setShowDropdown(false);
  };

  const handleCloseModal = () => {
    if (selectedNotification && !selectedNotification.read) {
      markAsRead(selectedNotification.id);
    }
    setShowModal(false);
    setSelectedNotification(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Pressable onPress={handleMenuPress}>
          <MaterialIcons name="menu" size={24} color={colors.headerText} />
        </Pressable>
        
        <Heading style={{ color: colors.headerText }}>{title}</Heading>
        
        <View>
          <Pressable onPress={handleNotificationsPress} style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color={colors.headerText} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Dropdown de notificações */}
          {showDropdown && (
            <View style={[styles.dropdown, { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
            }]}>
              <View style={[styles.dropdownHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.dropdownTitle, { color: colors.text }]}>
                  Notificações
                </Text>
              </View>

              <ScrollView style={styles.dropdownContent} 
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}>
                {isLoadingNotifications ? (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Carregando...
                    </Text>
                  </View>
                ) : notifications.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="notifications-none" size={48} color={colors.textTertiary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Sem notificações novas
                    </Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        { 
                          backgroundColor: notification.read 
                            ? colors.backgroundApp 
                            : colors.infoBackground,
                          borderBottomColor: colors.border,
                          opacity: notification.read ? 0.6 : 1,
                        }
                      ]}
                      onPress={() => handleNotificationClick(notification)}
                    >
                      <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                          {!notification.read && (
                            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                          )}
                          <Text 
                            style={[
                              styles.notificationTitle, 
                              { color: colors.text }
                            ]}
                            numberOfLines={1}
                          >
                            {notification.title}
                          </Text>
                        </View>
                        <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
                          {formatDate(notification.createdAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Modal de detalhes da notificação */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View style={[styles.cardModal, { backgroundColor: colors.cardBackground }]}>
            <Box style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalHeaderIcon}>📬</Text>
            </Box>

            <View style={styles.modalBody}>
              <ScrollView 
                style={styles.modalScrollContainer}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <VStack style={styles.modalContent}>
                  <Heading style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedNotification?.title}
                  </Heading>

                  <Box style={[styles.messageBox, { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border 
                  }]}>
                    <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                      {selectedNotification?.content}
                    </Text>
                  </Box>

                  {selectedNotification && (
                    <Text style={[styles.modalTime, { color: colors.textTertiary }]}>
                      {formatDate(selectedNotification.createdAt)}
                    </Text>
                  )}
                </VStack>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  onPress={handleCloseModal}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Backdrop para fechar o dropdown */}
      {showDropdown && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    zIndex: 1000,
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 320,
    maxHeight: 400,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContent: {
    flexGrow: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  notificationItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  notificationContent: {
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    marginLeft: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  // Estilos de modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardModal: {
    width: '90%',
    maxWidth: 400,
    height: '80%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderIcon: {
    fontSize: 36,
  },
  modalBody: {
    flex: 1,
  },
  modalScrollContainer: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  messageBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
  },
  modalTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 16,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});