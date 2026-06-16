// Pantalla de Directorio.
// Muestra el directorio de CUCEI dentro de un WebView
// y un botón para volver a la pantalla anterior del stack.

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { DIRECTORY_URL } from '../../config';

export default class Directorio extends Component {
  // Botón regresar: vuelve a la pantalla anterior en la navegación
  handleBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <View style={styles.container}>
        {/* Header con botón Volver + título */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={this.handleBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Directorio</Text>
        </View>

        {/* Contenido principal: WebView que ocupa el resto de la pantalla */}
        <View style={styles.content}>
          <WebView
            // Página externa con el directorio (no se altera su estilo interno)
            source={{ uri: DIRECTORY_URL }}
            style={styles.webview}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // Contenedor raíz de la pantalla
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Barra superior con botón de volver y título
  header: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Botón "← Volver"
  backButton: {
    backgroundColor: '#2cc0e6',   // mismo color que en otras pantallas para consistencia
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  backText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Título "Directorio" centrado visualmente
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 30,
    color: '#02baed',
    fontStyle: 'italic',
    marginRight: 40, // compensa el espacio del botón para que se vea centrado
  },
  // Contenedor del WebView
  content: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  // Estilo del WebView (redondeado y transparente sobre el fondo)
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
});