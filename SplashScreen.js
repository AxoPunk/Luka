import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkCodigo = async () => {
      const validado = await AsyncStorage.getItem('codigoValidado');
      if (validado === 'true') {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Invite');
      }
    };
    checkCodigo();
  }, [navigation]);
  return (
    <View style={[styles.container, { backgroundColor: "#F9F9F6" }]}> 
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: COLORS.primary }}>MindCareIA</Text>
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
