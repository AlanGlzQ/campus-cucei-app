// Pantalla de perfil de alumno
// Muestra datos generales, avance academico (creditos adquiridos y promedio)
// y una grafica de promedio por ciclo. Incluye cierre de sesion

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

export default function PerfilAlumno({ route, navigation, user, onLogout }) {
  // Recibe datos via navegacion y/o desde el usuario en sesion
  const { alumno: alumnoParam = {}, academico: academicoParam = {} } =
    route?.params || {};

  // Medidas de pantalla para ajustar ancho de tarjetas y graficas
  const screenWidth = Dimensions.get("window").width;
  const CARD_HORIZONTAL_PADDING = 16;
  const cardWidth = Math.floor(screenWidth * 0.92);
  const chartWidth = Math.max(260, cardWidth - CARD_HORIZONTAL_PADDING * 2);

  // Fallback: si no vienen datos por params, usa lo que trae user (sesión restaurada)
  const alumno =
    alumnoParam && Object.keys(alumnoParam).length > 0
      ? alumnoParam
      : user?.alumno || {};
  const academico =
    academicoParam && Object.keys(academicoParam).length > 0
      ? academicoParam
      : user?.academico || {};

  // ===== Helpers de formato y calculo =======================================================
  // Normaliza el ciclo dejando solo año + letra (2024B, 2025A, etc)
  const normCycle = (c) => (c || "").toString().replace(/[^0-9AB]/g, "");

  //Compara ciclos por año y luego por letra (A/B)
  const compareCycles = (a, b) => {
    const ya = parseInt(a.slice(0, 4), 10);
    const yb = parseInt(b.slice(0, 4), 10);

    if (!Number.isNaN(ya) && !Number.isNaN(yb) && ya !== yb) {
      return ya - yb;
    }

    const ta = a[4] || "A";
    const tb = b[4] || "A";
    return ta.localeCompare(tb);
  };

  const toNumber = (s) => {
    const n = parseFloat((s ?? "").toString());
    return Number.isNaN(n) ? 0 : n;
  };

  // ===== Promedio actual ==============================================
  const currentAverage = useMemo(() => {
    // Si ya viene el promedio calculado desde el php como numero se usa directo
    if (typeof academico?.promedio === "number") {
      return academico.promedio;
    }
    const materias = Array.isArray(academico?.materias)
      ? academico.materias
      : [];
    if (!materias.length) return 0;

    // Calculo de promedio
    let w = 0;
    let c = 0;
    for (const m of materias) {
      const cred = m?.creditos || 0;
      const grade = toNumber(m?.calificacion);
      w += grade * cred;
      c += cred;
    }
    return c ? +(w / c).toFixed(2) : 0;
  }, [academico]);

  // ===== Créditos y porcentajes =======================================
  const creditsEarned = Number(academico?.creditos || 0);
  const creditsRequired = Number(academico?.creditosRequeridos || 0);

  // Porcentaje de creditos cursados respecto al total requerido
  const creditsPct = creditsRequired
    ? (creditsEarned / creditsRequired) * 100
    : 0;

  // ===== Serie por ciclo (para la gráfica) ============================
  const cycleSeries = useMemo(() => {
    const materias = Array.isArray(academico?.materias)
      ? academico.materias
      : [];
    const buckets = {};

    // Agrupa por ciclo y calcula promedio ponderado en cada uno
    for (const m of materias) {
      const ciclo = normCycle(m?.ciclo);
      if (!ciclo) continue;

      const cred = m?.creditos || 0;
      const grade = toNumber(m?.calificacion);
      if (!buckets[ciclo]) {
        buckets[ciclo] = { w: 0, c: 0 };
      }
      buckets[ciclo].w += grade * cred;
      buckets[ciclo].c += cred;
    }

    const labels = Object.keys(buckets).sort(compareCycles);
    const data = labels.map((label) => {
      const { w, c } = buckets[label];
      return c ? +(w / c).toFixed(2) : 0;
    });

    return { labels, data };
  }, [academico]);

  const hasCycleData =
    cycleSeries.labels?.length &&
    cycleSeries.data?.length &&
    cycleSeries.data.some((v) => v > 0);

  // ===== Estado de UI (mostrar/ocultar avance) ======================================================
  // Controla si se muestra la seccion de "Avance academico"
  const [showAdvance, setShowAdvance] = useState(false);

  // ===== Animaciones para los anillos (creditos y promedio) ================================
  // Valores actuales (0-1) que alimentan el ProgressChart
  const [creditsProgress, setCreditsProgress] = useState(0); // 0–1
  const [avgProgress, setAvgProgress] = useState(0); // 0–1

  // Animated.Value usados para interpolar del 0 al valor objetivo (promedio y/o creditos)
  const creditsAnim = useRef(new Animated.Value(0)).current;
  const avgAnim = useRef(new Animated.Value(0)).current;

  // Cuando se abre la seccion de avance, se lanza la animacion
  useEffect(() => {
    if (!showAdvance) {
      // si la seccion esta cerrada no se hace nada
      return;
    }

    const targetCredits = Math.min(Math.max(creditsPct / 100 || 0, 0), 1);
    const targetAvg = Math.min(Math.max(currentAverage / 100 || 0, 0), 1);

    // reset a 0 cada vez que abrimos la sección para mostrar la animacion cada vez
    creditsAnim.setValue(0);
    avgAnim.setValue(0);
    setCreditsProgress(0);
    setAvgProgress(0);

    // Listeners para ir actualizando el state en cada frame de la animacion
    const creditsListener = creditsAnim.addListener(({ value }) => {
      setCreditsProgress(value);
    });
    const avgListener = avgAnim.addListener(({ value }) => {
      setAvgProgress(value);
    });

    // Para ejecutar la animacion en los dos anillos a la vez
    Animated.parallel([
      Animated.timing(creditsAnim, {
        toValue: targetCredits,
        duration: 250,// <- aqui se puede ajustar la velocidad
        useNativeDriver: false,
      }),
      Animated.timing(avgAnim, {
        toValue: targetAvg,
        duration: 500,// <- aqui tambien 
        useNativeDriver: false,
      }),
    ]).start();

    // Limpiar listeners cuando cambie la dependencia o se desmonte
    return () => {
      creditsAnim.removeListener(creditsListener);
      avgAnim.removeListener(avgListener);
    };
  }, [showAdvance, creditsPct, currentAverage, creditsAnim, avgAnim]);

  //========== Headers de navegacion / sesion ===========================================
  const handleExit = () => {
    // Boton para regresar al inicio
    navigation.navigate("Inicio");
  };

  const handleKardex = () => {
    // Navega a la pantalla de Kardex , mandando materias y datos del alumno
    navigation.navigate("Kardex", {
      materias: Array.isArray(academico?.materias)
        ? academico.materias
        : [],
      alumno,
      academico,
    });
  };

  const handleLogoutPress = async () => {
    // Limpia datos de sesion guardados en AsyncStorage
    try {
      await AsyncStorage.removeItem("userData");
    } catch (err) {
      console.log("Error limpiando userData:", err);
    }

    // Notifica al contenedor (Menu) si envio onLogout
    if (typeof onLogout === "function") {
      onLogout();
    }

    // Resetea la navegacion para que no se pueda volver atras a pantallas protegidas
    navigation.reset({
      index: 0,
      routes: [{ name: "Inicio" }],
    });
  };

  // ===== Render ========================================================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Datos del alumno</Text>

      {/* Datos básicos */}
      <View style={styles.card}>
        <Row label="Nombre" value={alumno?.nombre} />
        <Row label="Código" value={alumno?.codigo} />
        <Row label="Carrera" value={alumno?.carrera} />
        <Row label="Campus" value={alumno?.campus} />
        <Row label="Ciclo" value={alumno?.ciclo} />
        <Row label="Situación" value={alumno?.situacion} />
      </View>

      {/* Toggle de Avance Académico */}
      <TouchableOpacity
        style={styles.cta}
        onPress={() => setShowAdvance((prev) => !prev)}
      >
        <Text style={styles.ctaText}>
          Avance académico {showAdvance ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {/* Sección de avance */}
      {showAdvance && (
        <View style={styles.advanceContainer}>
          {/* Tarjeta de anillos (créditos + promedio) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Avance académico</Text>

            <View style={styles.metricsRow}>
              {/* Créditos */}
              <View style={styles.metricBox}>
                <ProgressChart
                  data={{
                    labels: [],
                    data: [creditsProgress],
                  }}
                  width={Math.min(screenWidth * 0.42, 280)}
                  height={180}
                  strokeWidth={12}
                  radius={44}
                  chartConfig={chartConfig}
                  hideLegend
                  style={styles.metricChart}
                />
                {creditsRequired > 0 ? (
                  <>
                    <Text style={styles.metricValue}>
                      {creditsPct.toFixed(2)}%
                    </Text>
                    <Text style={styles.metricLabel}>Créditos adquiridos</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.metricValue}>—</Text>
                    <Text style={styles.metricLabel}>
                      Créditos no disponibles
                    </Text>
                  </>
                )}
              </View>

              {/* Promedio */}
              <View style={styles.metricBox}>
                <ProgressChart
                  data={{
                    labels: [],
                    data: [avgProgress],
                  }}
                  width={Math.min(screenWidth * 0.42, 280)}
                  height={180}
                  strokeWidth={12}
                  radius={44}
                  chartConfig={chartConfig}
                  hideLegend
                  style={styles.metricChart}
                />
                <Text style={styles.metricValue}>
                  {currentAverage.toFixed(2)}
                </Text>
                <Text style={styles.metricLabel}>Promedio general</Text>
              </View>
            </View>
          </View>

          {/* Gráfica por ciclo */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Promedio por ciclo</Text>
            {hasCycleData ? (
              <LineChart
                data={{
                  labels: cycleSeries.labels,
                  datasets: [
                    { data: cycleSeries.data },
                    {
                      // línea invisible para fijar tope en 100
                      data: Array(
                        (cycleSeries.labels && cycleSeries.labels.length) || 1
                      ).fill(100),
                      withDots: false,
                      strokeWidth: 0,
                      color: () => "rgba(0,0,0,0)",
                    },
                  ],
                }}
                width={chartWidth}
                height={260}
                fromZero
                segments={10}
                formatYLabel={(v) => `${Math.round(Number(v))}`}
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={chartConfig}
                bezier
                style={styles.chartFix}
                verticalLabelRotation={45}
              />
            ) : (
              <Text style={styles.helper}>Sin materias para graficar.</Text>
            )}
          </View>
        </View>
      )}

      {/* Botón Kardex */}
      <TouchableOpacity style={styles.kardexBtn} onPress={handleKardex}>
        <Text style={styles.kardexText}>Kardex</Text>
      </TouchableOpacity>

      {/* Volver a inicio */}
      <TouchableOpacity style={styles.backBtn} onPress={handleExit}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
        <View style={styles.logoutContent}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
          <Icon name="log-out-outline" size={22} color="#ffffff" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Componente reutilizable para mostrar una fila "Etiqueta: Valor"
function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

// Configuracion de colores y estilo para las graficas
const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(44, 192, 230, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: { r: "4" },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#173b82",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: "40%",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#02baed",
    marginBottom: 16,
  },
  card: {
    width: "92%",
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#575199",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 18,
  },
  row: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#02baed",
    fontWeight: "bold",
  },
  value: {
    fontSize: 18,
    color: "#000000",
  },
  cta: {
    width: "92%",
    backgroundColor: "#02baed",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  advanceContainer: {
    width: "100%",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  helper: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 6,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricBox: {
    width: "49%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  metricChart: {
    alignSelf: "center",
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#374151",
  },
  chartFix: {
    borderRadius: 16,
    marginTop: 12,
    alignSelf: "center",
    overflow: "hidden",
  },
  kardexBtn: {
    backgroundColor: "#51589e",
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  kardexText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backBtn: {
    backgroundColor: "#02baed",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 24,
  },
  backText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#e11d48",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 30,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
});