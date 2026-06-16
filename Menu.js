// Componente raíz de navegación de la app.
// Se encarga de:
// - Cargar la sesión guardada desde AsyncStorage al inicio.
// - Exponer handlers para login / logout y pasar los datos de usuario a PerfilAlumno.
// - Definir el stack de pantallas (Inicio, Directorio, Video, Mapa, Login, Perfil, Kardex).

import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (!isMounted) return;

        if (storedUser) {
          // Si hay sesión guardada, la parseamos y la guardamos en estado
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Error al cargar sesión:", error);
      } finally {
        // Aunque haya error, dejamos de mostrar el loader
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSession();

    // Evita actualizar estado si el componente ya se desmontó
    return () => {
      isMounted = false;
    };
  }, []);

  // Guarda sesión cuando el usuario inicia sesión correctamente
  const handleLogin = useCallback(async (userData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.log("Error guardando sesión:", error);
    }
    // Actualizamos el estado global de usuario
    setUser(userData);
  }, []);

  // Borra sesión cuando el usuario cierra sesión desde PerfilAlumno
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("userData");
    } catch (error) {
      console.log("Error cerrando sesión:", error);
    }
    // Limpiamos usuario en memoria
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
        {/* Pantallas base visibles desde el menú principal */}
        <Stack.Screen name="Inicio" component={PRINCIPAL} />
        <Stack.Screen name="Directorio" component={DIRECTORIO} />
        <Stack.Screen name="Video" component={VIDEO} />
        <Stack.Screen name="Mapa" component={MAPA} />

        {/* 
          Login:
          - Solo se llega navegando desde Inicio.
          - Si ya hay sesión válida, el propio Login hace auto-skip a PerfilAlumno.
          - Aquí inyectamos onLoginSuccess para actualizar estado global (user).
        */}
        <Stack.Screen name="Login">
          {(props) => (
            <LOGIN
              {...props}
              onLoginSuccess={handleLogin}
            />
          )}
        </Stack.Screen>

        {/*
          PerfilAlumno:
          - Siempre disponible en el stack.
          - Recibe user (sesión cargada al inicio o tras login).
          - Recibe onLogout para poder limpiar AsyncStorage + estado global.
        */}
        <Stack.Screen name="PerfilAlumno">
          {(props) => (
            <ALUMNO
              {...props}
              user={user}
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>

        {/* Kardex: usa los datos que se le pasan desde PerfilAlumno vía route.params */}
        <Stack.Screen name="Kardex" component={KARDEX} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Contenedor del loader inicial mientras se verifica la sesión
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
