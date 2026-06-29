// Pantalla de Directorio.
// Muestra el directorio de CUCEI dentro de un WebView
// y un botón para volver a la pantalla anterior del stack.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { DIRECTORY_URL } from '../../config';

export default function Directorio({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header con botón Volver + título */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Directorio</Text>
      </View>

      {/* Contenido principal: WebView que ocupa el resto de la pantalla */}
      <View style={styles.content}>
        <WebView
          source={{ uri: DIRECTORY_URL }}
          style={styles.webview}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#2cc0e6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  backText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 30,
    color: '#02baed',
    fontStyle: 'italic',
    marginRight: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
