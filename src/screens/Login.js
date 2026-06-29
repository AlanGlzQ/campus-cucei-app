// Pantalla de Login.
// Solo maneja UI y estado local — toda la lógica de red y sesión
// está en src/services/authService.js

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { loginWithCredentials, saveSession, loadSession } from '../services/authService';

export default function Login({ navigation, route, onLoginSuccess }) {
  const [codigo, setCodigo]   = useState('');
  const [nip, setNip]         = useState('');
  const [loading, setLoading] = useState(false);
  const [showNip, setShowNip] = useState(false);

  // Auto-skip: si ya hay sesión válida, salta directo a PerfilAlumno
  const tryAutoSkip = useCallback(async () => {
    if (route?.params?.allowAutoSkip !== true) return;

    const session = await loadSession();
    if (!session) return;

    navigation.replace('PerfilAlumno', {
      datos: session.alumno,
      alumno: session.alumno,
      academico: session.academico,
    });
  }, [navigation, route]);

  useFocusEffect(
    useCallback(() => {
      tryAutoSkip();
      return () => {};
    }, [tryAutoSkip])
  );

  const handleLogin = useCallback(async () => {
    if (!codigo || !nip) {
      Alert.alert('Datos incompletos', 'Ingresa tu código y NIP.');
      return;
    }

    setLoading(true);
    const result = await loginWithCredentials(codigo, nip);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
      return;
    }

    const { alumno, academico } = result;
    const userPayload = { alumno, academico: academico || {} };

    await saveSession(userPayload);

    Alert.alert('Bienvenido', `Hola ${alumno.nombre}`);

    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(userPayload);
    }

    navigation.replace('PerfilAlumno', { datos: alumno, alumno, academico });
  }, [codigo, nip, navigation, onLoginSuccess]);

  const handleSalir = useCallback(() => {
    setCodigo('');
    setNip('');
    navigation.navigate('Inicio');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UDG</Text>

      {/* Campo Código */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-circle" size={25} color="#02baed" />
        <TextInput
          placeholder="Código"
          placeholderTextColor="gray"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="none"
          keyboardType="numeric"
          style={styles.textInput}
        />
      </View>

      {/* Campo NIP con toggle de visibilidad */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={22} color="#02baed" />
        <TextInput
          placeholder="NIP"
          placeholderTextColor="gray"
          secureTextEntry={!showNip}
          value={nip}
          onChangeText={setNip}
          autoCapitalize="none"
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={() => setShowNip(prev => !prev)}
          style={styles.eyeButton}
        >
          <Ionicons name={showNip ? 'eye-off' : 'eye'} size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Botón Ingresar */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color="white" />
            <Text style={[styles.buttonText, styles.buttonTextLoading]}>
              Iniciando...
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>

      {/* Botón Salir */}
      <TouchableOpacity onPress={handleSalir} style={styles.secondaryButton}>
        <Text style={styles.buttonText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#173b82',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 50,
    color: '#02baed',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  inputContainer: {
    borderColor: '#02baed',
    borderWidth: 2,
    width: '100%',
    maxWidth: 320,
    height: 50,
    marginTop: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textInput: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
  eyeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  primaryButton: {
    backgroundColor: '#02baed',
    borderRadius: 10,
    width: '100%',
    maxWidth: 320,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  secondaryButton: {
    backgroundColor: '#1d213d',
    borderRadius: 10,
    width: '100%',
    maxWidth: 320,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextLoading: {
    marginLeft: 8,
  },
});
