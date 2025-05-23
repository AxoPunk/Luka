import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './theme';

export default function HomeScreen() {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
      <Text style={{ fontSize: 24, color: COLORS.primary }}>Bienvenido a MindCare</Text>
      <Text style={{ fontSize: 18, color: COLORS.text, marginTop: 16, textAlign: 'center' }}>
        Gracias por formar de nuestra beta cerrada.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
