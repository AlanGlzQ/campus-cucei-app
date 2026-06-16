// Mapa interactivo de CUCEI.
// - Bloquea la pantalla en modo horizontal mientras está abierto.
// - Muestra el mapa del campus con hotspots (rectángulos invisibles).
// - Cada hotspot abre un modal con carrusel de fotos y descripción del edificio.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';

// Imagen base del mapa (para no repetir el require)
const MAP_SRC = require('../../assets/mapa_2024.jpg');

// Lista de módulos/edificios que se muestran en el mapa.
// Cada módulo define:
//  - id: identificador único
//  - title: nombre mostrado en el modal
//  - rect: posición/tamaño del hotspot en porcentaje relativo al mapa
//  - images: fotos para el carrusel
//  - description: texto descriptivo del lugar
const MODULES = [
  {
    id: 'modulo A',
    title: 'Rectoría',
    rect: { leftPct: 0.84, topPct: 0.45, widthPct: 0.055, heightPct: 0.05 },
    images: [
      require('../../assets/rectoria1.jpg'),
      require('../../assets/rectoria2.jpg'),
    ],
    description: 'La Rectoría es el edificio principal del centro universitario.',
  },
  {
    id: 'Proulex',
    title: 'Proulex',
    rect: { leftPct: 0.79, topPct: 0.42, widthPct: 0.05, heightPct: 0.06 },
    images: [require('../../assets/interiores/proulex.jpg')],
    description: 'Dentro de centro universitario se encuentra un módulo de Proulex.',
  },
  {
    id: 'Edificio B',
    title: 'Edificio B',
    rect: { leftPct: 0.84, topPct: 0.3, widthPct: 0.025, heightPct: 0.053 },
    images: [require('../../assets/imagenes_modulos/moduloB.jpg')],
    description:
      'Aulas y laboratorios de docencia mixtos; típico para materias básicas de varias ingenierías.',
  },
  {
    id: 'Edificio C',
    title: 'Edificio C',
    rect: { leftPct: 0.81, topPct: 0.3, widthPct: 0.025, heightPct: 0.055 },
    images: [
      require('../../assets/imagenes_modulos/moduloC.jpg'),
      require('../../assets/imagenes_modulos/moduloC1.jpg'),
    ],
    description:
      'Aulas mixtas y servicios cercanos a la entrada por Calzada Olímpica; alberga clases generales de distintos programas.',
  },
  {
    id: 'Edificio D',
    title: 'Edificio D',
    rect: { leftPct: 0.77, topPct: 0.31, widthPct: 0.025, heightPct: 0.07 },
    images: [
      require('../../assets/imagenes_modulos/moduloD.jpg'),
      require('../../assets/imagenes_modulos/moduloD1.jpg'),
      require('../../assets/imagenes_modulos/moduloD2.jpg'),
    ],
    description:
      'Aulas/laboratorios mixtos y zona colindante con la biblioteca; algunos laboratorios de investigación como Microbiología e Inocuidad de Alimentos.',
  },
  {
    id: 'modAlpha',
    title: 'Edificio Alpha (UCT1)',
    rect: { leftPct: 0.5, topPct: 0.21, widthPct: 0.02, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/alfa.jpg'),
      require('../../assets/imagenes_modulos/alfa1.jpg'),
      require('../../assets/imagenes_modulos/alfa2.jpg'),
      require('../../assets/imagenes_modulos/alfa3.jpg'),
    ],
    description:
      'Salas de cómputo institucionales para tareas, prácticas y exámenes en compu; administrados por el DCC/DivTIC.',
  },
  {
    id: 'Cafebrería',
    title: 'Cafebrería',
    rect: { leftPct: 0.485, topPct: 0.25, widthPct: 0.02, heightPct: 0.03 },
    images: [
      require('../../assets/imagenes_modulos/cafebreria.jpg'),
      require('../../assets/imagenes_modulos/cafebreria1.jpg'),
    ],
    description:
      'Se encuentra al lado del edificio Alpha, consiste en un espacio de recreación y alimentación para estudiantes.',
  },
  {
    id: 'modBeta',
    title: 'Edificio Beta (UCT2)',
    rect: { leftPct: 0.52, topPct: 0.229, widthPct: 0.02, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/beta.jpg'),
      require('../../assets/imagenes_modulos/beta1.jpg'),
      require('../../assets/imagenes_modulos/beta2.jpg'),
    ],
    description:
      'Salas de cómputo institucionales para tareas, prácticas y exámenes en compu; administrados por el DCC/DivTIC.',
  },
  {
    id: 'Edificio I',
    title: 'Edificio I',
    rect: { leftPct: 0.52, topPct: 0.28, widthPct: 0.017, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/moduloI.jpg'),
      require('../../assets/imagenes_modulos/moduloI1.jpg'),
      require('../../assets/imagenes_modulos/moduloI2.jpg'),
      require('../../assets/imagenes_modulos/moduloI3.jpg'),
    ],
    description:
      'Aulas y laboratorios generales usados por varias coordinaciones; típico para cursos de tronco común.',
  },
  {
    id: 'Edificio J',
    title: 'Edificio J',
    rect: { leftPct: 0.471, topPct: 0.33, widthPct: 0.018, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/moduloJ.jpg'),
      require('../../assets/imagenes_modulos/moduloJ1.jpg'),
      require('../../assets/imagenes_modulos/moduloJ2.jpg'),
      require('../../assets/imagenes_modulos/moduloJ3.jpg'),
    ],
    description:
      'Paquete de laboratorios de Química de docencia (Química General, Orgánica, Fisicoquímica, etc.).',
  },
  {
    id: 'Edificio H',
    title: 'Edificio H',
    rect: { leftPct: 0.472, topPct: 0.38, widthPct: 0.02, heightPct: 0.07 },
    images: [
      require('../../assets/imagenes_modulos/moduloH.jpg'),
      require('../../assets/imagenes_modulos/moduloH1.jpg'),
      require('../../assets/imagenes_modulos/moduloH2.jpg'),
      require('../../assets/imagenes_modulos/moduloH3.jpg'),
    ],
    description:
      'Docencia e investigación en áreas bio/farma; laboratorios de Inmunofarmacología y Microbiología Sanitaria.',
  },
  {
    id: 'Edificio K',
    title: 'Edificio K',
    rect: { leftPct: 0.448, topPct: 0.31, widthPct: 0.018, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/moduloK.jpg'),
      require('../../assets/imagenes_modulos/moduloK1.jpg'),
      require('../../assets/imagenes_modulos/moduloK2.jpg'),
    ],
    description: 'Aulas/laboratorios de uso mixto (ingenierías variadas).',
  },
  {
    id: 'Edificio F',
    title: 'Edificio F',
    rect: { leftPct: 0.52, topPct: 0.34, widthPct: 0.038, heightPct: 0.04 },
    images: [
      require('../../assets/imagenes_modulos/moduloF.jpg'),
      require('../../assets/imagenes_modulos/moduloF1.jpg'),
    ],
    description:
      'Aulas de docencia y laboratorios compartidos (ciencias básicas/ingenierías) según la carga del semestre.',
  },
  {
    id: 'Edificio E',
    title: 'Edificio E',
    rect: { leftPct: 0.57, topPct: 0.33, widthPct: 0.025, heightPct: 0.08 },
    images: [require('../../assets/imagenes_modulos/moduloE.jpg')],
    description:
      'Casa de Química: aquí están las coordinaciones de Químico, Químico Farmacobiólogo (QFB) e Ingeniería Química; gran parte de la vida académica de esas carreras sucede aquí.',
  },
  {
    id: 'Biblioteca',
    title: 'Centro Integral de Documentación (CID)',
    rect: { leftPct: 0.7, topPct: 0.29, widthPct: 0.05, heightPct: 0.034 },
    images: [
      require('../../assets/imagenes_modulos/CID.jpg'),
      require('../../assets/interiores/CID.jpg'),
    ],
    description:
      'Biblioteca del plantel con servicios de autoacceso; préstamo de libros y laptops, estudio y trabajo.',
  },
  {
    id: 'Titanic',
    title: 'Titanic',
    rect: { leftPct: 0.38, topPct: 0.1, widthPct: 0.03, heightPct: 0.04 },
    images: [
      require('../../assets/imagenes_modulos/titanic.jpg'),
      require('../../assets/imagenes_modulos/titanic1.jpg'),
    ],
    description:
      'Instalación conocida por su estacionamiento, multifunciones e inundaciones.',
  },
  {
    id: 'Edificio U',
    title: 'Edificio U',
    rect: { leftPct: 0.335, topPct: 0.15, widthPct: 0.018, heightPct: 0.06 },
    images: [
      require('../../assets/imagenes_modulos/moduloU.jpg'),
      require('../../assets/imagenes_modulos/moduloU1.jpg'),
    ],
    description:
      'Aulas y laboratorios para proyectos y prácticas; compartido por varias ingenierías.',
  },
  {
    id: 'Edificio T',
    title: 'Edificio T',
    rect: { leftPct: 0.358, topPct: 0.17, widthPct: 0.018, heightPct: 0.06 },
    images: [
      require('../../assets/imagenes_modulos/moduloT.jpg'),
      require('../../assets/imagenes_modulos/moduloT1.jpg'),
      require('../../assets/imagenes_modulos/moduloT2.jpg'),
    ],
    description:
      'Aulas/laboratorios mixtos; soporte a cursos medios y avanzados de ingeniería.',
  },
  {
    id: 'Edificio R',
    title: 'Edificio R',
    rect: { leftPct: 0.377, topPct: 0.21, widthPct: 0.018, heightPct: 0.06 },
    images: [
      require('../../assets/imagenes_modulos/moduloR.jpg'),
      require('../../assets/imagenes_modulos/moduloR1.jpg'),
      require('../../assets/imagenes_modulos/moduloR2.jpg'),
    ],
    description:
      'Aulas/laboratorios de uso compartido; suele alojar prácticas interdepartamentales.',
  },
  {
    id: 'Edificio P',
    title: 'Edificio P',
    rect: { leftPct: 0.409, topPct: 0.19, widthPct: 0.02, heightPct: 0.065 },
    images: [
      require('../../assets/imagenes_modulos/moduloP.jpg'),
      require('../../assets/imagenes_modulos/moduloP1.jpg'),
      require('../../assets/imagenes_modulos/moduloP2.jpg'),
    ],
    description:
      'Aulas/laboratorios mixtos; apoyo para materias aplicadas de varias carreras.',
  },
  {
    id: 'Edificio Q',
    title: 'Edificio Q',
    rect: { leftPct: 0.412, topPct: 0.12, widthPct: 0.017, heightPct: 0.07 },
    images: [
      require('../../assets/imagenes_modulos/moduloQ.jpg'),
      require('../../assets/imagenes_modulos/moduloQ1.jpg'),
      require('../../assets/imagenes_modulos/moduloQ2.jpg'),
    ],
    description:
      'Aulas de docencia y laboratorios generales; rotan entre departamentos.',
  },
  {
    id: 'Auditorio Ing. Jorge Matute Remus',
    title: 'Auditorio Matute Remus',
    rect: { leftPct: 0.433, topPct: 0.25, widthPct: 0.05, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/auditorio_matute.jpg'),
      require('../../assets/imagenes_modulos/auditorio_matute1.jpg'),
    ],
    description:
      'Auditorio principal del campus para congresos, ceremonias y eventos masivos.',
  },
  {
    id: 'Consultorio',
    title: 'Consultorio',
    rect: { leftPct: 0.465, topPct: 0.165, widthPct: 0.025, heightPct: 0.045 },
    images: [require('../../assets/imagenes_modulos/consultorio.jpg')],
    description:
      'Instalación acondicionada para consultas médicas y atención médica inmediata.',
  },
  {
    id: 'Edificio L',
    title: 'Edificio L',
    rect: { leftPct: 0.465, topPct: 0.21, widthPct: 0.025, heightPct: 0.04 },
    images: [
      require('../../assets/imagenes_modulos/moduloL.jpg'),
      require('../../assets/imagenes_modulos/moduloL1.jpg'),
      require('../../assets/imagenes_modulos/moduloL2.jpg'),
      require('../../assets/imagenes_modulos/moduloL3.jpg'),
    ],
    description:
      'Aulas y espacios de laboratorio compartidos por distintas carreras: sede frecuente de clases teóricas.',
  },
  {
    id: 'Edificio Z2',
    title: 'Edificio Z2',
    rect: { leftPct: 0.217, topPct: 0.48, widthPct: 0.018, heightPct: 0.06 },
    images: [
      require('../../assets/imagenes_modulos/modulo_Z2_1.jpg'),
      require('../../assets/imagenes_modulos/modulo_Z2_2.jpg'),
      require('../../assets/imagenes_modulos/modulo_Z2_3.jpg'),
      require('../../assets/imagenes_modulos/modulo_Z2.jpg'),
    ],
    description: 'Instalación adaptada para la enseñanza interactiva y aplicada.',
  },
  {
    id: 'Edificio Z1',
    title: 'Edificio Z1',
    rect: { leftPct: 0.217, topPct: 0.59, widthPct: 0.027, heightPct: 0.04 },
    images: [
      require('../../assets/imagenes_modulos/modulo_Z1.jpg'),
      require('../../assets/imagenes_modulos/modulo_Z1_1.jpg'),
      require('../../assets/imagenes_modulos/modulo_Z1_2.jpg'),
      require('../../assets/imagenes_modulos/modulo_Z1_3.jpg'),
    ],
    description: 'Instalación adaptada para la enseñanza interactiva y aplicada.',
  },
  {
    id: 'Edificio N',
    title: 'Edificio N',
    rect: { leftPct: 0.379, topPct: 0.33, widthPct: 0.02, heightPct: 0.065 },
    images: [
      require('../../assets/imagenes_modulos/moduloN1.jpg'),
      require('../../assets/imagenes_modulos/moduloN.jpg'),
      require('../../assets/imagenes_modulos/moduloN2.jpg'),
      require('../../assets/imagenes_modulos/moduloN3.jpg'),
      require('../../assets/imagenes_modulos/moduloN4.jpg'),
    ],
    description:
      'Bloque de aulas y prácticas compartidas (ingenierías); su uso varía según el semestre.',
  },
  {
    id: 'Edificio M',
    title: 'Edificio M',
    rect: { leftPct: 0.41, topPct: 0.33, widthPct: 0.02, heightPct: 0.065 },
    images: [
      require('../../assets/imagenes_modulos/moduloM.jpg'),
      require('../../assets/imagenes_modulos/moduloM1.jpg'),
      require('../../assets/imagenes_modulos/moduloM2.jpg'),
      require('../../assets/interiores/moduloM.jpg'),
      require('../../assets/interiores/moduloM1.jpg'),
      require('../../assets/interiores/moduloM2.jpg'),
    ],
    description:
      'Aulas/laboratorios mixtos en la franja norte del campus; clases de varias ingenierías.',
  },
  {
    id: 'Edificio X',
    title: 'Edificio X',
    rect: { leftPct: 0.19, topPct: 0.35, widthPct: 0.02, heightPct: 0.065 },
    images: [require('../../assets/imagenes_modulos/moduloX.jpg')],
    description:
      'Aulas/laboratorios de múltiples carreras; zona de clases y prácticas.',
  },
  {
    id: 'Edificio W',
    title: 'Edificio W',
    rect: { leftPct: 0.216, topPct: 0.38, widthPct: 0.025, heightPct: 0.065 },
    images: [
      require('../../assets/imagenes_modulos/moduloW.jpg'),
      require('../../assets/imagenes_modulos/moduloW1.jpg'),
      require('../../assets/imagenes_modulos/moduloW2.jpg'),
    ],
    description:
      'Aulas de docencia y laboratorios de apoyo; uso generalista.',
  },
  {
    id: 'Edificio Z',
    title: 'Edificio Z',
    rect: { leftPct: 0.235, topPct: 0.55, widthPct: 0.029, heightPct: 0.038 },
    images: [
      require('../../assets/imagenes_modulos/moduloZ.jpg'),
      require('../../assets/imagenes_modulos/moduloZ1.jpg'),
      require('../../assets/imagenes_modulos/moduloZ2.jpg'),
      require('../../assets/imagenes_modulos/moduloZ3.jpg'),
    ],
    description:
      'Aulas/laboratorios de docencia general; apoyo a varias ingenierías.',
  },
  {
    id: 'Edificio Y',
    title: 'Edificio Y',
    rect: { leftPct: 0.265, topPct: 0.46, widthPct: 0.025, heightPct: 0.055 },
    images: [
      require('../../assets/imagenes_modulos/moduloY.jpg'),
      require('../../assets/imagenes_modulos/moduloY1.jpg'),
    ],
    description:
      'Aulas y la lonaria para eventos: ferias y actividades estudiantiles.',
  },
  {
    id: 'Auditorio Nikolai',
    title: 'Auditorio Nikolai',
    rect: { leftPct: 0.242, topPct: 0.48, widthPct: 0.022, heightPct: 0.055 },
    images: [require('../../assets/imagenes_modulos/auditorio_nikolai.jpg')],
    description: 'Instalación utilizada para exposiciones o pláticas profesionales.',
  },
  {
    id: 'Edificio S2',
    title: 'Edificio S2',
    rect: { leftPct: 0.283, topPct: 0.31, widthPct: 0.02, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/modulo_S2.jpg'),
      require('../../assets/imagenes_modulos/modulo_S2_1.jpg'),
      require('../../assets/imagenes_modulos/modulo_S2_2.jpg'),
    ],
    description:
      'Paquete de aulas y espacios de prácticas para distintas coordinaciones.',
  },
  {
    id: 'Edificio V',
    title: 'Edificio V',
    rect: { leftPct: 0.25, topPct: 0.22, widthPct: 0.02, heightPct: 0.06 },
    images: [
      require('../../assets/imagenes_modulos/moduloV.jpg'),
      require('../../assets/imagenes_modulos/moduloV1.jpg'),
      require('../../assets/imagenes_modulos/moduloV2.jpg'),
    ],
    description:
      'Núcleo de Física y Matemáticas: coordinaciones y posgrados/espacios asociados.',
  },
  {
    id: 'Edificio V2',
    title: 'Edificio V2',
    rect: { leftPct: 0.272, topPct: 0.25, widthPct: 0.018, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/modulo_V2.jpg'),
      require('../../assets/imagenes_modulos/modulo_V2_1.jpg'),
    ],
    description:
      'Anexo del eje físico-matemático; sala de asesorías del Departamento de Matemáticas.',
  },
  {
    id: 'Edificio S',
    title: 'Edificio S',
    rect: { leftPct: 0.317, topPct: 0.31, widthPct: 0.02, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/moduloS.jpg'),
      require('../../assets/imagenes_modulos/moduloS1.jpg'),
      require('../../assets/interiores/moduloS.jpg'),
    ],
    description:
      'Paquete de aulas y espacios de prácticas para distintas coordinaciones.',
  },
  {
    id: 'Edificio O',
    title: 'Edificio O',
    rect: { leftPct: 0.345, topPct: 0.33, widthPct: 0.02, heightPct: 0.05 },
    images: [
      require('../../assets/imagenes_modulos/moduloO.jpg'),
      require('../../assets/imagenes_modulos/moduloO1.jpg'),
      require('../../assets/imagenes_modulos/moduloO2.jpg'),
      require('../../assets/imagenes_modulos/moduloO3.jpg'),
      require('../../assets/interiores/moduloO.jpg'),
    ],
    description:
      '"Ventanilla" de muchas ingenierías: coordinaciones de Biomédica, Computación, Electrónica, Informática, Robótica e Industrial, Civil y Topografía, Mecánica Eléctrica, Alimentos y Biotecnología.',
  },
  {
    id: 'Edificio G',
    title: 'Edificio G',
    rect: { leftPct: 0.433, topPct: 0.53, widthPct: 0.04, heightPct: 0.08 },
    images: [
      require('../../assets/imagenes_modulos/moduloG.jpg'),
      require('../../assets/imagenes_modulos/moduloG1.jpg'),
      require('../../assets/imagenes_modulos/moduloG2.jpg'),
      require('../../assets/imagenes_modulos/moduloG3.jpg'),
    ],
    description:
      'Bloque químico: espacios del Departamento de Química para docencia y prácticas.',
  },
  // Aquí podrías seguir agregando más módulos si los necesitas.
];

// Componente principal del mapa
export default function MapaAdaptado({ navigation }) {
  // id del módulo activo (para mostrar en el modal)
  const [activeModuleId, setActiveModuleId] = useState(null);
  // Tamaño real en píxeles del contenedor del mapa (para traducir % a px)
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  // Controla si se muestra la pantalla de hint "Gira tu celular"
  const [showHint, setShowHint] = useState(true);

  // Al montar el componente, bloqueamos la orientación en LANDSCAPE.
  // Al desmontar, liberamos la orientación.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Cuando el usuario presiona "Continuar" en el hint,
  // volvemos a forzar LANDSCAPE (por si acaso) y ocultamos el mensaje.
  const handleContinue = useCallback(async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setShowHint(false);
  }, []);

  // Botón volver: libera orientación y regresa a la pantalla anterior
  const handleExit = useCallback(
    async () => {
      await ScreenOrientation.unlockAsync();
      navigation.goBack();
    },
    [navigation]
  );

  // Se ejecuta cuando se mide el layout del contenedor del mapa
  const handleMapLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    setMapSize({ width, height });
  }, []);

  // Convierte los porcentajes de rect en estilos absolutos en píxeles
  const rectToStyle = useCallback(
    (rect) => {
      const { width, height } = mapSize;
      if (!width || !height) return { display: 'none' };

      const { leftPct, topPct, widthPct, heightPct } = rect;
      return {
        position: 'absolute',
        left: width * leftPct,
        top: height * topPct,
        width: width * widthPct,
        height: height * heightPct,
        // Descomenta si quieres ver los cuadros de depuración:
        // borderColor: 'red',
        // borderWidth: 1,
      };
    },
    [mapSize]
  );

  // Resolvemos el módulo activo a partir de su id
  const activeModule = MODULES.find((m) => m.id === activeModuleId) || null;

  const closeModal = useCallback(() => {
    setActiveModuleId(null);
  }, []);

  // Renderiza el contenido del modal para un módulo (carrusel + descripción)
  const renderModuleModalContent = (module) => {
    if (!module) return null;

    const images = module.images ?? [];

    return (
      <View style={{ width: '100%' }}>
        <Text style={styles.modalText}>{module.title}</Text>

        <ScrollView style={styles.modalScroll}>
          <PagerView style={styles.pager} initialPage={0}>
            {images.length > 0 ? (
              images.map((src, idx) => {
                // Lógica para mostrar las flechas del carrusel:
                const isFirst = idx === 0; // La primera imagen solo muestra ">"
                const showLeftArrow = !isFirst; // Desde la segunda muestra "<"
                const showRightArrow = idx < images.length - 1; // La última ya no muestra ">"

                return (
                  <View style={styles.page} key={`img-${idx}`}>
                    <View style={styles.pageImageWrapper}>
                      <Image
                        source={src}
                        style={styles.pageImage}
                        resizeMode="contain"
                      />

                      {/* Flecha izquierda (solo en imágenes > 0) */}
                      {showLeftArrow && (
                        <View style={[styles.arrowContainer, styles.arrowLeft]}>
                          <Ionicons
                            name="chevron-back"
                            size={28}
                            color="#ffffff"
                          />
                        </View>
                      )}

                      {/* Flecha derecha (todas menos la última) */}
                      {showRightArrow && (
                        <View style={[styles.arrowContainer, styles.arrowRight]}>
                          <Ionicons
                            name="chevron-forward"
                            size={28}
                            color="#ffffff"
                          />
                        </View>
                      )}
                    </View>

                    <Text style={styles.photoLabel}>Foto {idx + 1}</Text>
                  </View>
                );
              })
            ) : (
              <View style={[styles.page, { height: 250 }]}>
                <Text>Sin imágenes</Text>
              </View>
            )}
          </PagerView>

          {module.description ? (
            <Text style={styles.modalDescription}>{module.description}</Text>
          ) : null}

          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={closeModal}
          >
            <Text style={styles.textStyle}>Cerrar ventana</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  };

  // Pantalla previa de aviso (hint) para pedir modo horizontal
  if (showHint) {
    return (
      <View style={styles.hintContainer}>
        <Text style={styles.hintTitle}>Gira tu celular</Text>
        <Text style={styles.hintText}>
          Este mapa se visualiza mejor en modo horizontal.
        </Text>
        <TouchableOpacity style={styles.hintButton} onPress={handleContinue}>
          <Text style={styles.hintButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla principal del mapa
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Mapa CUCEI</Text>

      {/* Botón volver (usa handleExit para liberar orientación) */}
      <TouchableOpacity onPress={handleExit} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      {/* Contenedor del mapa (toma todo el espacio disponible) */}
      <View style={styles.mapContainer} onLayout={handleMapLayout}>
        <Image source={MAP_SRC} style={styles.mapImage} resizeMode="cover" />

        {/* Hotspots (uno por módulo) */}
        {mapSize.width > 0 &&
          mapSize.height > 0 &&
          MODULES.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setActiveModuleId(m.id)}
              style={rectToStyle(m.rect)}
              activeOpacity={0.7}
            />
          ))}
      </View>

      {/* Modal genérico para el módulo activo */}
      {activeModule && (
        <Modal
          animationType="slide"
          transparent
          visible={!!activeModule}
          onRequestClose={closeModal}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {renderModuleModalContent(activeModule)}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ===== Estilos ===== */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#173b82',
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
    color: '#02baed',
  },

  // Contenedor del mapa (responsivo sobre el ancho disponible)
  mapContainer: {
    width: '100%',
    height: '85%',
    aspectRatio: 1.55, // relación de aspecto aproximada del mapa
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#000',
    position: 'relative', // necesario para posicionar hotspots y botón
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },

  // Botón "← Volver" flotante en la parte inferior izquierda
  backButton: {
    position: 'absolute',
    left: 30,
    bottom: 12,
    backgroundColor: '#02baed',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Fondo semitransparente del modal
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // Tarjeta del modal
  modalView: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#fafafa',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  modalText: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalDescription: {
    marginTop: 8,
    textAlign: 'justify',
    fontSize: 14,
    color: '#111827',
  },
  modalScroll: {
    width: '100%',
    maxHeight: 400,
  },

  // Carrusel (PagerView)
  pager: {
    height: 200,
    width: '60%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 12,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageImageWrapper: {
    width: '100%',
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageImage: {
    width: '80%',
    height: '100%',
  },

  // Contenedores de las flechas "<" y ">"
  arrowContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: -18, // centra verticalmente el icono
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },

  photoLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },

  button: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonClose: {
    backgroundColor: '#02baed',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Pantalla de hint inicial (modo portrait)
  hintContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  hintTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hintText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 400,
  },
  hintButton: {
    backgroundColor: '#02baed',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  hintButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});