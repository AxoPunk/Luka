import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { COLORS } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null); // null: no autenticado, {}: invitado, objeto: Google
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verifica si hay usuario invitado por código
      const code = await AsyncStorage.getItem('codigoValidadoId');
      if (!code) {
        navigation.replace('Invite');
        return;
      }
      try {
        const docRef = doc(db, 'codeInvite', code);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ ...docSnap.data(), invitado: true });
        }
      } catch (e) {}
      setLoading(false);
    };
    checkAuth(); 
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('codigoValidado');
    await AsyncStorage.removeItem('codigoValidadoId');
    navigation.replace('Invite');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={{ color: COLORS.primary }}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    // No autenticado
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
        <Text style={{ fontSize: 24, color: COLORS.primary, marginBottom: 16 }}>Perfil</Text>
        <Text style={styles.logoutButton} onPress={handleLogout}>Cerrar sesión</Text>
      </View>
    );
  }

  // Invitado por código
  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
      <Text style={{ fontSize: 24, color: COLORS.primary, marginBottom: 16 }}>Perfil</Text>
      <Text style={{ fontSize: 18, color: COLORS.text, marginBottom: 8 }}>Nombre: {user.nombre || 'No disponible'}</Text>
      <Text style={{ fontSize: 18, color: COLORS.text, marginBottom: 24 }}>Email: {user.email || 'No disponible'}</Text>
      <Text style={styles.logoutButton} onPress={handleLogout}>Cerrar sesión</Text>
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
  logoutButton: {
    backgroundColor: COLORS.error,
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    width: 180,
    alignSelf: 'center',
    marginTop: 8,
  },
});
