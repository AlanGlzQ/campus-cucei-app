// Pantalla principal (Inicio).
// Muestra el fondo con el círculo de CUCEI y cuatro accesos:
// Login, Directorio, Video y Mapa.

import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class Principal extends Component {
  // Navegación a la pantalla de Directorio
  irADirectorio = () => {
    this.props.navigation.navigate('Directorio');
  };

  // Navegación a la pantalla de Video
  irAVideo = () => {
    console.log('Pulsando Video');
    this.props.navigation.navigate('Video');
  };

  // Navegación a la pantalla del Mapa interactivo
  irAMapa = () => {
    console.log('Pulsando Mapa');
    this.props.navigation.navigate('Mapa');
  };

  // Navegación a la pantalla de Login
  // allowAutoSkip: true permite saltar login si ya hay sesión guardada
  irALogin = () => {
    console.log('Pulsando log-in');
    this.props.navigation.navigate('Login', { allowAutoSkip: true });
  };

  render() {
    return (
      <ImageBackground
        source={require('../../assets/cuceiSinLetras.png')} // fondo con círculo
        style={styles.fondo}
        resizeMode="cover"
      >
        {/* Logo de CUCEI sobre el círculo */}
        <Image
          source={require('../../assets/letras_cucei_sinFondo.png')}
          style={styles.logo}
          resizeMode="cover"
        />

        {/* Contenedor de los iconos, centrado dentro del círculo */}
        <View style={styles.overlay}>
          {/* Fila 1: Login / Directorio */}
          <View style={styles.row}>
            <TouchableOpacity onPress={this.irALogin} style={styles.iconButton}>
              <Icon name="log-in" size={100} color="#47b7d6" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.irADirectorio}
              style={styles.iconButton}
            >
              <Icon
                name="file-tray-full-sharp"
                size={100}
                color="#1d213d"
              />
            </TouchableOpacity>
          </View>

          {/* Fila 2: Video / Mapa */}
          <View style={styles.row}>
            <TouchableOpacity onPress={this.irAVideo} style={styles.iconButton}>
              <Icon name="logo-youtube" size={100} color="red" />
            </TouchableOpacity>

            <TouchableOpacity onPress={this.irAMapa} style={styles.iconButton}>
              <Icon name="map" size={100} color="#c4ad66" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  // Fondo general de la pantalla (ocupa toda la altura y centra contenido)
  fondo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Contenedor cuadrado centrado para alinear los 4 iconos dentro del círculo
  overlay: {
    width: '70%',      // ajusta si el círculo es más grande/pequeño (65–80%)
    aspectRatio: 1,    // cuadrado
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Logo "CUCEI" que se dibuja en la parte superior del círculo
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 5,
    marginTop: 70,
    marginBottom: -30,
  },
  // Fila que agrupa dos iconos (2x2 en total)
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',     // separación horizontal entre iconos
    marginBottom: -15, // separación vertical entre filas
    marginTop: 1,
  },
  // Contenedor individual de cada icono
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});