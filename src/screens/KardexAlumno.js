// Pantalla de Kardex del alumno.
// Muestra las materias agrupadas por ciclo (secciones) con sus datos
// y un resumen de créditos por ciclo.

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from "react-native";

export default function Kardex({ route, navigation }) {
  // Recibimos desde navegación la lista de materias y datos del alumno.
  // Si no vienen, usamos valores por defecto.
  const { materias = [], alumno = {} } = route?.params || {};

  // Normaliza el ciclo a un formato tipo YYYY[A/B]
  const normCycle = (c) => (c ?? "").toString().replace(/[^0-9AB]/g, "");

  // Ordena ciclos por año y luego por letra (A/B), defendiendo casos raros
  const compareCycles = (a, b) => {
    const ya = parseInt(a.slice(0, 4), 10);
    const yb = parseInt(b.slice(0, 4), 10);

    const bothValidYears = !Number.isNaN(ya) && !Number.isNaN(yb);

    // Si ambos tienen año válido y son distintos, ordena por año
    if (bothValidYears && ya !== yb) {
      return ya - yb;
    }

    // Si no, ordena por la letra A/B (o "A" por default)
    const ta = a[4] || "A";
    const tb = b[4] || "A";
    return ta.localeCompare(tb);
  };

  // Agrupar materias por ciclo y construir las secciones de la SectionList
  const sections = useMemo(() => {
    // Si no hay arreglo de materias, regresamos lista vacía
    if (!Array.isArray(materias) || materias.length === 0) {
      return [];
    }

    // buckets[ciclo] = arreglo de materias en ese ciclo
    const buckets = {};

    materias.forEach((m) => {
      const cy = normCycle(m?.ciclo) || "Sin ciclo";
      if (!buckets[cy]) buckets[cy] = [];
      buckets[cy].push(m);
    });

    // Ordenamos los ciclos usando el comparador definido arriba
    const labels = Object.keys(buckets).sort(compareCycles);

    // Transformamos el diccionario en arreglo de secciones ordenadas
    return labels.map((label, index) => ({
      // key única por sección (recomendado para SectionList)
      key: `sec-${label}-${index}`,
      title: label,
      // Dentro de cada ciclo, ordenamos materias por descripción
      data: (buckets[label] || []).sort((x, y) =>
        (x?.descripcion || "").localeCompare(y?.descripcion || "")
      ),
    }));
  }, [materias]);

  // Key única por materia, combinando nrc/clave + índice por seguridad
  const keyExtractor = (item, idx) =>
    `mat-${item?.nrc || item?.clave || "x"}-${idx}`;

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.container}
      stickySectionHeadersEnabled={false}
      // Usamos la key definida en cada sección
      sectionKeyExtractor={(section) => section.key}
      ListHeaderComponent={<Text style={styles.pageTitle}>Kardex</Text>}
      ListEmptyComponent={
        <Text style={styles.empty}>No hay materias disponibles.</Text>
      }
      ListFooterComponent={
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      }
    />
  );
}

// Renderiza una materia individual dentro de una sección (ciclo)
const renderItem = ({ item }) => (
  <View style={styles.materiaRow}>
    <Text style={styles.materiaTitle}>{item?.descripcion || "—"}</Text>

    <Text style={styles.materiaCred}>
      Créditos: {item?.creditos ? item.creditos : "—"}
    </Text>

    {/* Línea con clave, NRC y fecha */}
    <View style={styles.materiaMeta}>
      <Text style={styles.metaLabel}>Clave:</Text>
      <Text style={styles.metaValue}>{item?.clave || "—"}</Text>

      <Text style={styles.metaLabel}>NRC:</Text>
      <Text style={styles.metaValue}>{item?.nrc || "—"}</Text>

      <Text style={styles.metaLabel}>Fecha:</Text>
      <Text style={styles.metaValue}>{item?.fecha || "—"}</Text>
    </View>

    {/* Calificación */}
    <View style={styles.materiaMeta}>
      <Text style={styles.metaLabel}>Calificación:</Text>
      <Text style={styles.metaValue}>{item?.calificacion || "—"}</Text>
    </View>

    {/* Tipo de materia (obligatoria, optativa, etc.) */}
    <View style={styles.materiaMeta}>
      <Text style={styles.metaLabel}>Tipo:</Text>
      <Text style={styles.metaValue}>{item?.tipo || "—"}</Text>
    </View>
  </View>
);

// Renderiza el encabezado de cada sección (un ciclo)
// Incluye el nombre del ciclo y el total de créditos en ese ciclo
const renderSectionHeader = ({ section: { title, data } }) => {
  const totalCredits = (data || []).reduce(
    (acc, cur) => acc + (Number(cur?.creditos) || 0),
    0
  );

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>
        {data.length} materia(s) — {totalCredits} créditos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor general del contenido de la lista
  container: {
    backgroundColor: "#173b82",
    alignItems: "center",
    paddingTop: 22,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  // Título principal de la pantalla
  pageTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#02baed",
    marginBottom: 12,
    alignSelf: "center",
  },
  // Encabezado de cada sección (ciclo)
  sectionHeader: {
    width: "92%",
    backgroundColor: "#02baed",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#e4e7edff",
    marginTop: 2,
  },
  // Tarjeta de cada materia
  materiaRow: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 150,
    justifyContent: "space-between",
  },
  materiaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#02baed",
    marginBottom: 6,
    textAlign: "center",
  },
  materiaCred: {
    fontSize: 14,
    color: "#00a3cbff",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  // Contenedor para las filas de metadatos (clave, NRC, fecha, etc.)
  materiaMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-start",
  },
  metaLabel: {
    fontSize: 13,
    color: "#000000ff",
    fontWeight: "600",
    marginRight: 4,
  },
  metaValue: {
    fontSize: 13,
    color: "#1118279d",
    marginRight: 12,
  },
  // Botón de volver al final de la lista
  backBtn: {
    backgroundColor: "#02baed",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
    alignSelf: "center",
  },
  backText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Mensaje cuando no hay materias para mostrar
  empty: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 24,
    textAlign: "center",
  },
});