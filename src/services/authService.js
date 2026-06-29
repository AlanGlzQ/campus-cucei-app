// Servicio de autenticación.
// Centraliza toda la lógica de red, parseo de respuestas y datos demo,
// dejando las pantallas libres de lógica de negocio.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_URL, USE_MOCK_AUTH } from '../../config';

// Datos de ejemplo para modo demo (USE_MOCK_AUTH = true en config.js)
const MOCK_ALUMNO = {
  nombre: 'Alumno Demo',
  codigo: '000000000',
  carrera: 'Ingeniería en Computación',
  campus: 'CUCEI',
  ciclo: '2024B',
  situacion: 'Activo',
};

const MOCK_ACADEMICO = {
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

// Parsea la respuesta cruda del servidor y separa alumno / academico.
// El servidor a veces regresa JSON válido, a veces dos objetos pegados (}{).
export function parseAuthResponse(raw) {
  const trimmed = (raw || '').trim();
  let alumno = null;
  let academico = null;

  try {
    // Intento 1: JSON válido (objeto o arreglo)
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      alumno   = parsed.find(o => o?.nombre && o?.codigo) || parsed[0] || null;
      academico = parsed.find(o => o?.promedio !== undefined || o?.materias) || null;
    } else {
      alumno = parsed;
    }
  } catch {
    try {
      // Intento 2: dos JSON pegados — {"alumno":...}{"academico":...}
      // Insertamos coma entre } y { para formar un arreglo válido
      const fixed = `[${trimmed.replace(/}\s*{/g, '},{')}]`;
      const arr = JSON.parse(fixed);

      alumno   = arr.find(o => o?.nombre && o?.codigo) || arr[0] || null;
      academico = arr.find(o => o?.promedio !== undefined || o?.materias) || null;
    } catch (err) {
      console.log('Error parseando respuesta de auth:', err);
    }
  }

  return { alumno, academico };
}

// Intenta autenticar con código y NIP.
// Retorna { success, alumno, academico, error }
export async function loginWithCredentials(codigo, nip) {
  try {
    if (USE_MOCK_AUTH) {
      // Modo demo: devuelve datos de ejemplo sin llamar al servidor
      return { success: true, alumno: MOCK_ALUMNO, academico: MOCK_ACADEMICO };
    }

    const url = `${AUTH_URL}?codigo=${encodeURIComponent(codigo)}&nip=${encodeURIComponent(nip)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return { success: false, error: 'No se pudo conectar con el servidor' };
    }

    const raw = await response.text();
    const { alumno, academico } = parseAuthResponse(raw);

    if (alumno?.nombre) {
      return { success: true, alumno, academico };
    }

    return { success: false, error: 'Código o NIP incorrectos' };
  } catch (err) {
    console.log('Error en loginWithCredentials:', err);
    return { success: false, error: 'Respuesta inválida del servidor' };
  }
}

// Guarda la sesión del usuario en AsyncStorage
export async function saveSession(userPayload) {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userPayload));
  } catch (err) {
    console.log('Error guardando sesión:', err);
  }
}

// Carga la sesión guardada. Retorna el payload o null si no hay sesión válida.
export async function loadSession() {
  try {
    const stored = await AsyncStorage.getItem('userData');
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const alumno = parsed?.alumno;

    // Validamos que la sesión tenga al menos nombre y código
    if (!alumno?.nombre || !alumno?.codigo) return null;

    return parsed;
  } catch (err) {
    console.log('Error cargando sesión:', err);
    return null;
  }
}

// Elimina la sesión guardada en AsyncStorage
export async function clearSession() {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (err) {
    console.log('Error eliminando sesión:', err);
  }
}
