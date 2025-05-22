import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from './theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Invite');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.primary }}>Luka</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
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
