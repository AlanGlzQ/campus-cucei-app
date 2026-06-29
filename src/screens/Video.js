// Pantalla de Video Institucional.
// Carga el video desde una URL externa hosteada en GitHub Pages,
// evitando redespliegues de la app al cambiar el contenido del video.

import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { VIDEO_URL } from '../../config';

export default function Video({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Botón Volver */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Video Institucional</Text>

      <View style={styles.videoFondo}>
        <View style={styles.videoYoutube}>
          <WebView
            source={{ uri: VIDEO_URL }}
            style={styles.webview}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#173b82',
  },
  header: {
    paddingTop: 160,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#02baed',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  titulo: {
    fontSize: 30,
    textAlign: 'center',
    marginTop: 20,
    color: '#02baed',
  },
  videoFondo: {
    width: '95%',
    aspectRatio: 16 / 9,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginTop: 40,
    alignSelf: 'center',
    elevation: 5,
  },
  videoYoutube: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
