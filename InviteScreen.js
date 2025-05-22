import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './theme';

const INVITE_CODE = 'axopunk2025';

export default function InviteScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [countdown, setCountdown] = useState(10);

  React.useEffect(() => {
    let timer;
    if (lockout && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (lockout && countdown === 0) {
      setLockout(false);
      setAttempts(0);
      setCountdown(10);
      setError('');
    }
    return () => clearTimeout(timer);
  }, [lockout, countdown]);

  const handleValidate = () => {
    if (lockout) return;
    if (code.trim().toLowerCase() === INVITE_CODE) {
      setError('');
      setAttempts(0);
      navigation.replace('MainTabs');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockout(true);
        setError('Demasiados intentos. Espera 10 segundos...');
      } else {
        setError('Código incorrecto');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}> 
      <Text style={{ fontSize: 22, marginBottom: 20, color: COLORS.text }}>Ingresa tu código de invitación</Text>
      <TextInput
        style={[styles.input, { color: COLORS.text, borderColor: COLORS.primary, backgroundColor: '#fff' }]}
        placeholder="Código de invitación"
        placeholderTextColor={COLORS.textSecondary}
        value={code}
        onChangeText={setCode}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!lockout}
      />
      {lockout && (
        <Text style={{ color: COLORS.error, marginTop: 10 }}>
          Demasiados intentos. Espera {countdown} segundos...
        </Text>
      )}
      {!lockout && error ? <Text style={{ color: COLORS.error, marginTop: 10 }}>{error}</Text> : null}
      <TouchableOpacity style={[styles.button, lockout && { opacity: 0.5 }]} onPress={handleValidate} disabled={lockout}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Validar</Text>
      </TouchableOpacity>
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 10,
  },
});
