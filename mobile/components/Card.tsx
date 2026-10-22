import { useComponentColors } from '@/hooks/useComponentColors';
import { Image } from '@gluestack-ui/themed';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const iconDesktop = require('../assets/images/PC-icon.png');
const iconSmartphone = require('../assets/images/Smartphone-icon.png');
const iconTablet = require('../assets/images/Tablet-icon.png');
const iconNotebook = require('../assets/images/Notebook-icon.png');
const iconPeripherals = require('../assets/images/Peripherals-icon.png');

interface CardProps {
  id?: string;
  title: string;
  type?: string; // tipo do equipamento, para o ícone; sem ele, o ícone padrão
  description: string;
  date: string; // AvailabilityDate property, this is a timestamp obtained from the backend
}

export default function Card(props: CardProps) {
  const { colors } = useComponentColors();
  const setIcon = (type?: string) => {
    let icon = null;
    
    switch (type) {
      case 'Desktop':
        icon = iconDesktop;
        break;
      case 'SmartPhone':
        icon = iconSmartphone;
        break;
      case 'Tablet':
        icon = iconTablet;
        break;
      case 'Notebook':
        icon = iconNotebook;
        break;
      case 'Peripherals':
        icon = iconPeripherals;
        break;  
      default:
        icon = iconDesktop;
    }

    return icon;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.headerBackground }]}>
      <View style={styles.cardHead}>
        <View style={styles.cardTitle}>
          <Image
            alt="icon"
            source={setIcon(props.type)}
            style={[styles.icon, { tintColor: colors.headerText }]}
            width={24}
            height={24}
          />
          <Text style={[styles.titleText, { color: colors.headerText }]}>
            {props.title}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {props.date}
        </Text>
      </View>
      <Text style={[styles.descriptionText, { color: colors.headerText }]}>
        {props.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: 98,
    width: '100%',
    maxWidth: 800,
    justifyContent: 'center',
    paddingInline: 20,
    paddingBlock: 12,
    borderRadius: 12,
  },
  cardHead: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBody: {},
  cardTitle: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    textAlign: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '300',
    fontSize: 20,
  },
  dateText: {
    fontSize: 14,
  },
  descriptionText: {
    fontWeight: '300',
    fontSize: 20,
    lineHeight: 40,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
