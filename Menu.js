// Componente raíz de navegación de la app.
// Se encarga de:
// - Cargar la sesión guardada desde AsyncStorage al inicio.
// - Exponer handlers para login / logout y pasar los datos de usuario a PerfilAlumno.
// - Definir el stack de pantallas (Inicio, Directorio, Video, Mapa, Login, Perfil, Kardex).
 
import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { loadSession, saveSession, clearSession } from "./src/services/authService";
 
// Pantallas de la app
import PRINCIPAL from "./src/screens/Principal";
import DIRECTORIO from "./src/screens/Directorio";
import VIDEO from "./src/screens/Video";
import MAPA from "./src/screens/MapaLite";
import LOGIN from "./src/screens/Login";
import ALUMNO from "./src/screens/PerfilAlumno";
import KARDEX from "./src/screens/KardexAlumno";
 
const Stack = createNativeStackNavigator();
 
export default function Menu() {
  // user: datos del usuario logueado (alumno + academico)
  const [user, setUser] = useState(null);
  // isLoading: indica si todavía estamos revisando AsyncStorage al arrancar
  const [isLoading, setIsLoading] = useState(true);
 
  // Carga la sesión guardada en AsyncStorage al iniciar la app
  useEffect(() => {
    let isMounted = true;
 
    const init = async () => {
      const session = await loadSession();
      if (isMounted) {
        if (session) setUser(session);
        setIsLoading(false);
      }
    };
 
    init();
    return () => { isMounted = false; };
  }, []);
 
  // Guarda sesión cuando el usuario inicia sesión correctamente
  const handleLogin = useCallback(async (userData) => {
    await saveSession(userData);
    setUser(userData);
  }, []);
 
  // Borra sesión cuando el usuario cierra sesión desde PerfilAlumno
  const handleLogout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);
 
  // Mientras se revisa si hay sesión previa, mostramos un loader
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2cc0e6" />
      </View>
    );
  }
 
  return (
    <NavigationContainer>
      {/* Stack principal; iniciamos en "Inicio" (pantalla principal) */}
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Inicio"     component={PRINCIPAL} />
        <Stack.Screen name="Directorio" component={DIRECTORIO} />
        <Stack.Screen name="Video"      component={VIDEO} />
        <Stack.Screen name="Mapa"       component={MAPA} />
 
        {/*
          Login: inyectamos onLoginSuccess para actualizar estado global.
          Si ya hay sesión válida, Login hace auto-skip a PerfilAlumno.
        */}
        <Stack.Screen name="Login">
          {(props) => (
            <LOGIN {...props} onLoginSuccess={handleLogin} />
          )}
        </Stack.Screen>
 
        {/*
          PerfilAlumno: recibe user (sesión cargada al inicio o tras login)
          y onLogout para limpiar AsyncStorage + estado global.
        */}
        <Stack.Screen name="PerfilAlumno">
          {(props) => (
            <ALUMNO {...props} user={user} onLogout={handleLogout} />
          )}
        </Stack.Screen>
 
        {/* Kardex: recibe datos desde PerfilAlumno vía route.params */}
        <Stack.Screen name="Kardex" component={KARDEX} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});