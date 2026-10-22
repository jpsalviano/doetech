import { useComponentColors } from '@/hooks/useComponentColors';
import { Box, Text } from '@gluestack-ui/themed';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity } from 'react-native';

type Option = { label: string; value: string };

type SelectProps = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  buttonStyle?: any;
  modalStyle?: any;
  containerStyle?: any;
  placeholder?: string;
  isDisabled?: boolean
};

export default function SelectInput({
  options,
  value,
  onChange,
  buttonStyle,
  modalStyle,
  containerStyle,
  placeholder,
  isDisabled
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const { colors } = useComponentColors();

  return (
    <Box style={containerStyle}>
      <TouchableOpacity disabled={isDisabled} onPress={() => setOpen(true)} style={buttonStyle}>
        <Text style={[styles.selectText, { color: value ? colors.text : colors.placeholder }]}>
          {options.find((o) => o.value === value)?.label ?? placeholder ?? 'Selecione'}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity 
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} 
          onPress={() => setOpen(false)} 
          activeOpacity={1}
        />
        <Box style={[styles.modalContent, { backgroundColor: colors.surface }, modalStyle]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={[
                  styles.option, 
                  { borderBottomColor: colors.border },
                  item.value === value && { backgroundColor: colors.surfaceVariant }
                ]}
              >
                <Text style={{ color: item.value === value ? colors.primary : colors.text }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Box>
      </Modal>
    </Box>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    maxHeight: 300,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
  },
  selectText: {
    fontSize: 16,
  },
});
