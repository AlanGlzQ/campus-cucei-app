import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import { VIDEO_URL } from '../../config';

export default class Video extends Component {
  handleBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    
    //Dentro de un contenedor con su respectivo titulo, existe otro contenedor
    //exclusivamente para el video, este se toma de un link hosteado externamente
    //(en mi github personal en este caso), evitando asi tener que deployar la app cada que se 
    //cambie el video, solo cambiando el contendio del link externamente

    return (

      <View style={styles.container}>
        {/* Boton Volver */}
        <View style={styles.header}>
          <TouchableOpacity onPress={this.handleBack} style={styles.backButton}>
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
}

const styles = StyleSheet.create({
    fondo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#173b82',
  },
  titulo: {
    fontSize: 30,
    textAlign: "center",
    marginTop: 20,
    color: "#02baed",
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
});
