import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './theme';

export default function ProfileScreen() {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
      <Text style={{ fontSize: 24, color: COLORS.primary }}>Perfil</Text>
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
