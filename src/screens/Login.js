// Pantalla de Login.
// Permite al alumno autenticarse con código y NIP, guarda la sesión en AsyncStorage
// y redirige a PerfilAlumno. Si ya hay sesión guardada, puede hacer "auto-skip".

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { AUTH_URL } from '../../config';

// Helper: parsea la respuesta del servidor y separa alumno / academico
function parseAuthResponse(raw) {
  const trimmed = (raw || '').trim();
  let alumno = null;
  let academico = null;

  try {
    // Intento 1: respuesta como JSON válido (objeto o arreglo)
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      // Buscamos un objeto que parezca "alumno" (tenga nombre y código)
      const alumnoObj = parsed.find(o => o && o.nombre && o.codigo);
      // Buscamos un objeto que parezca "académico" (promedio o materias)
      const acaObj = parsed.find(
        o => o && (o.promedio !== undefined || o.materias)
      );

      alumno = alumnoObj || parsed[0] || null;
      academico = acaObj || null;
    } else {
      // Si no es arreglo, asumimos que todo es el alumno
      alumno = parsed;
    }
  } catch (e) {
    // Intento 2: muchas veces el servidor regresa dos JSON pegados sin coma: }{
    // Ej: {"alumno":...}{"academico":...}
    try {
      // Insertamos una coma entre } y { para formar un arreglo válido
      const fixed = `[${trimmed.replace(/}\s*{/g, '},{')}]`;
      const arr = JSON.parse(fixed);

      const alumnoObj = arr.find(o => o && o.nombre && o.codigo);
      const acaObj = arr.find(
        o => o && (o.promedio !== undefined || o.materias)
      );

      alumno = alumnoObj || arr[0] || null;
      academico = acaObj || null;
    } catch (err) {
      console.log('Error parseando respuesta de auth:', err);
    }
  }

  return { alumno, academico };
}

export default function Login({ navigation, route, onLoginSuccess }) {
  // Código y NIP introducidos por el usuario
  const [codigo, setCodigo] = useState('');
  const [nip, setNip] = useState('');
  // Estado de carga mientras se hace la petición al servidor
  const [loading, setLoading] = useState(false);
  // Controla si el NIP se ve en claro o como contraseña
  const [showNip, setShowNip] = useState(false);

  // Auto-skip si:
  // - El botón de Inicio mandó allowAutoSkip: true
  // - Y hay userData guardado con alumno válido (nombre + código)
  const tryAutoSkip = useCallback(async () => {
    const allowAutoSkip = route?.params?.allowAutoSkip === true;
    if (!allowAutoSkip) return;

    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      const alumno = parsed?.alumno;

      // Validamos que la sesión tenga al menos nombre y código
      if (!alumno || !alumno.nombre || !alumno.codigo) {
        console.log('userData encontrado pero incompleto, no auto-skip');
        return;
      }

      // Reemplazamos Login por PerfilAlumno directamente
      navigation.replace('PerfilAlumno', {
        datos: alumno,
        alumno,
        academico: parsed.academico,
      });
    } catch (err) {
      console.log('Error leyendo sesión para auto-skip:', err);
    }
  }, [navigation, route]);

  // Cada vez que la pantalla recupera el foco, intentamos auto-skip
  useFocusEffect(
    useCallback(() => {
      tryAutoSkip();
      return () => {};
    }, [tryAutoSkip])
  );

  // Lógica de login: valida campos, llama al auth.php o usa modo demo
  const handleLogin = useCallback(async () => {
    if (!codigo || !nip) {
      Alert.alert('Datos incompletos', 'Ingresa tu código y NIP.');
      return;
    }

    console.log('Intentando iniciar sesión...');

    setLoading(true);
    try {
      let alumno = null;
      let academico = null;

      if (USE_MOCK_AUTH) {
        // ===== MODO DEMO =====
        // No se llama al servidor, se usan datos de ejemplo
        alumno = {
          nombre: 'Alumno Demo',
          codigo: '000000000',
          carrera: 'Ingeniería en Computación',
          campus: 'CUCEI',
          ciclo: '2024B',
          situacion: 'Activo',
        };

        academico = {
          promedio: 95,
          creditos_adquiridos: 220,
          creditos_requeridos: 280,
          materias: [
            {
              ciclo: '2023A',
              descripcion: 'Matemáticas Discretas',
              creditos: 8,
              calificacion: 100,
              clave: 'MATDIS',
              nrc: '12345',
              tipo: 'Obligatoria',
              fecha: '2023-05-10',
            },
            {
              ciclo: '2023B',
              descripcion: 'Estructuras de Datos',
              creditos: 8,
              calificacion: 95,
              clave: 'ESTDAT',
              nrc: '23456',
              tipo: 'Obligatoria',
              fecha: '2023-12-01',
            },
          ],
        };
      } else {
        // ===== MODO REAL (backend de CUCEI) =====
        const url = `${AUTH_URL}?codigo=${encodeURIComponent(
          codigo
        )}&nip=${encodeURIComponent(nip)}`;

        const response = await fetch(url);
        if (!response.ok) {
          Alert.alert('Error', 'No se pudo conectar con el servidor');
          return;
        }

        const raw = await response.text();
        const parsed = parseAuthResponse(raw);
        alumno = parsed.alumno;
        academico = parsed.academico;
      }

      console.log('Respuesta (alumno):', alumno);

      if (alumno && alumno.nombre) {
        // Mensaje de bienvenida con el nombre del alumno
        Alert.alert('Bienvenido', `Hola ${alumno.nombre}`);

        const userPayload = { alumno, academico: academico || {} };

        // Guardar sesión en AsyncStorage para futuros auto-skip
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(userPayload));
        } catch (err) {
          console.log('Error guardando sesión:', err);
        }

        // Notificar al contenedor (Menu) que el login fue exitoso
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(userPayload);
        }

        // Navegar a PerfilAlumno reemplazando Login
        navigation.replace('PerfilAlumno', {
          datos: alumno,
          alumno,
          academico,
        });
      } else {
        // Si no se pudo extraer un alumno válido, asumimos credenciales inválidas
        Alert.alert('Error', 'Código o NIP incorrectos');
      }
    } catch (error) {
      console.log('Error al procesar la respuesta del servidor:', error);
      Alert.alert('Error', 'Respuesta inválida del servidor');
    } finally {
      setLoading(false);
    }
  }, [codigo, nip, navigation, onLoginSuccess]);


  // Botón "Salir": limpia los campos y regresa a la pantalla de Inicio
  const handleSalir = useCallback(() => {
    setCodigo('');
    setNip('');
    navigation.navigate('Inicio');
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Título principal del login (puedes cambiarlo por el logo si quieres) */}
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
          keyboardType="numeric" // solo números para el código
          style={styles.textInput}
        />
      </View>

      {/* Campo NIP con icono de ojo para mostrar/ocultar */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={22} color="#02baed" />
        <TextInput
          placeholder="NIP"
          placeholderTextColor="gray"
          secureTextEntry={!showNip} // alterna entre oculto / visible
          value={nip}
          onChangeText={setNip}
          autoCapitalize="none"
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={() => setShowNip(prev => !prev)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showNip ? 'eye-off' : 'eye'}
            size={22}
            color="white"
          />
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

// ===== Estilos ========================================================

const styles = StyleSheet.create({
  // Contenedor principal de la pantalla
  container: {
    flex: 1,
    backgroundColor: '#173b82',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Título "UDG"
  title: {
    fontSize: 50,
    color: '#02baed',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  // Contenedor de cada TextInput + icono
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
  // Estilo del campo de texto
  textInput: {
    fontSize: 18,
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
  // Área para el botón del ojo (NIP visible/oculto)
  eyeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  // Botón principal (Iniciar sesión)
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
  // Botón secundario (Salir)
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
  // Estilo cuando el botón está deshabilitado (cargando)
  buttonDisabled: {
    opacity: 0.7,
  },
  // Contenedor para spinner + texto en el botón
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Texto de los botones
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // Margen entre spinner y texto "Iniciando..."
  buttonTextLoading: {
    marginLeft: 8,
  },
});