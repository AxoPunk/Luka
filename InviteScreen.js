import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InviteScreen = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const navigation = useNavigation();

  const handleValidate = async () => {
    if (lockout) return;
    if (!code.trim()) {
      setError('Por favor ingresa un código.');
      return;
    }
    const codeLower = code.trim().toLowerCase();
    try {
      const docRef = doc(db, 'codeInvite', codeLower);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.usado === true) {
          setError('Este código ya ha sido utilizado.');
          return;
        }
        await updateDoc(docRef, { usado: true });
        await AsyncStorage.setItem('codigoValidado', 'true'); // Guardar flag local
        await AsyncStorage.setItem('codigoValidadoId', codeLower); // Guardar el ID del código
        setError('');
        setAttempts(0);
        navigation.replace('MainTabs', { user: userData });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setLockout(true);
          setError('Demasiados intentos. Espera 10 segundos...');
          setTimeout(() => {
            setLockout(false);
            setAttempts(0);
            setError('');
          }, 10000);
        } else {
          setError('Código incorrecto');
        }
      }
    } catch (error) {
      console.error('Error validando código:', error);
      setError('Error al validar el código. Intenta más tarde.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9F9F6"}]}>
      <Text style={[styles.title]}>Ingresa tu código de invitación</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        editable={!lockout}
        placeholder="Código"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.buttonContainer}>
        <Text
          style={[
            styles.button,
            lockout ? styles.buttonDisabled : styles.buttonActive,
          ]}
          onPress={!lockout ? handleValidate : undefined}
        >
          Validar
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 8,
  },
  button: {
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonActive: {
    backgroundColor: '#7C9CBF', // COLORS.primary
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#A9D6C3', // COLORS.secondary
    color: '#6B6B6B', // COLORS.textSecondary
  },
});

export default InviteScreen;
