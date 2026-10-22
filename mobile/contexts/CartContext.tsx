import { apiClient } from '@/api/apiClient';
import { useComponentColors } from '@/hooks/useComponentColors';
import { Button, ButtonText, Text } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useUserProfile } from './UserProfileContext';

interface CartContextType {
  equipmentIds: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);
  const [equipmentDetails, setEquipmentDetails] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { colors, formStyles } = useComponentColors();
  const { account } = useUserProfile();
  const router = useRouter();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(300)).current;

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

  useEffect(() => {
    if (showModal && equipmentIds.length > 0) {
      loadEquipmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, equipmentIds]);

  const loadEquipmentDetails = async () => {
    setIsLoading(true);
    try {
      const details = await Promise.all(
        equipmentIds.map((id) => apiClient.get(`/equipment/${id}`).then((res) => res.data))
      );
      setEquipmentDetails(details);
    } catch (err) {
      console.error('Error loading equipment details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (id: string) => {
    setEquipmentIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const removeFromCart = (id: string) => {
    setEquipmentIds((prev) => {
      const newEquipmentIds = prev.filter((equipId) => equipId !== id);
      if (newEquipmentIds.length === 0) {
        setShowModal(false);
      }
      return newEquipmentIds;
    });

    if (equipmentIds.length === 0) {
      setShowModal(!showModal);
    }
  };

  const clearCart = () => {
    setEquipmentIds([]);
    setEquipmentDetails([]);
  };

  const isInCart = (id: string) => {
    return equipmentIds.includes(id);
  };

  const handleFinalizeDonation = async () => {
    try {
      await apiClient.post('/donation', {
        recipientAccountId: account!.id,
        equipmentIds: equipmentIds,
      });
      clearCart();
      setShowModal(false);
      router.push('/equipments');
    } catch (err) {
      console.error('Error creating donation:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        equipmentIds,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount: equipmentIds.length,
      }}
    >
      {children}

      {equipmentIds.length > 0 && (
        <Button
          style={[styles.cartButton, { backgroundColor: colors.backgroundApp }]}
          onPress={() => setShowModal(true)}
        >
          <ButtonText style={[styles.cartButtonText, { color: colors.text }]}>
            🛒 ({equipmentIds.length})
          </ButtonText>
        </Button>
      )}

      <Modal
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={styles.centeredView} onPress={() => setShowModal(false)}>
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
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Itens no Carrinho
                </Text>

                {isLoading ? (
                  <Text
                    style={{
                      color: colors.text,
                      textAlign: 'center',
                      paddingVertical: 20,
                    }}
                  >
                    Carregando...
                  </Text>
                ) : (
                  <ScrollView style={styles.itemsList}>
                    {equipmentDetails.map((equipment) => (
                      <View
                        key={equipment.id}
                        style={[styles.cartItem, { borderBottomColor: colors.border }]}
                      >
                        <View style={styles.itemInfo}>
                          <Text style={[styles.itemTitle, { color: colors.text }]}>
                            {equipment.description}
                          </Text>
                          <Text style={[styles.itemType, { color: colors.textSecondary }]}>
                            {equipment.type}
                          </Text>
                        </View>
                        <Pressable
                          style={[styles.removeButton, { backgroundColor: colors.error }]}
                          onPress={() => removeFromCart(equipment.id)}
                        >
                          <Text style={styles.removeButtonText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View style={styles.modalButtons}>
                  <Pressable
                    style={[
                      formStyles.button,
                      styles.modalButton,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={[styles.buttonText, { color: colors.text }]}>Fechar</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      formStyles.button,
                      styles.modalButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={handleFinalizeDonation}
                  >
                    <Text style={[styles.buttonText, { color: colors.text }]}>
                      Finalizar
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  cartButton: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cartButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    width: '95%',
    maxHeight: '80%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  itemsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 14,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
