import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, setDoc, getDocs } from 'firebase/firestore';

const InviteScreen = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const navigation = useNavigation();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

  const handlePress = () => {
    if (!lockout) {
      animateButton();
      handleValidate();
    }
  };

  // Función para guardar datos emocionales en Firestore
  const saveEmotionalData = async (date, emotions) => {
    try {
      const codeInviteId = await AsyncStorage.getItem('codigoValidadoId');
      if (!codeInviteId) {
        throw new Error('No se encontró un código de invitación válido.');
      }

      const docRef = doc(db, `users/${codeInviteId}/emociones`, date);
      await setDoc(docRef, emotions);
      console.log('Datos emocionales guardados correctamente.');
    } catch (error) {
      console.error('Error al guardar datos emocionales:', error);
    }
  };

  // Función para recuperar datos emocionales desde Firestore
  const getEmotionalData = async () => {
    try {
      const codeInviteId = await AsyncStorage.getItem('codigoValidadoId');
      if (!codeInviteId) {
        throw new Error('No se encontró un código de invitación válido.');
      }

      const emocionesCollection = collection(db, `users/${codeInviteId}/emociones`);
      const querySnapshot = await getDocs(emocionesCollection);
      const emociones = [];
      querySnapshot.forEach((doc) => {
        emociones.push({ id: doc.id, ...doc.data() });
      });
      console.log('Datos emocionales recuperados:', emociones);
      return emociones;
    } catch (error) {
      console.error('Error al recuperar datos emocionales:', error);
      return [];
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
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            disabled={lockout}
            style={[
              styles.button,
              lockout ? styles.buttonDisabled : styles.buttonActive,
              { alignItems: 'center', justifyContent: 'center' }, // Centrado
            ]}
          >
            <Text style={{ color: lockout ? '#6B6B6B' : '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center', width: '100%' }}>Validar</Text>
          </TouchableOpacity>
        </Animated.View>
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
