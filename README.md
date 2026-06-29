# CampusCucei

![CI](https://github.com/AlanGlzQ/campus-cucei-app/actions/workflows/ci.yml/badge.svg)

CampusCucei es una app móvil hecha con **React Native + Expo** pensada para estudiantes de CUCEI.  
Permite iniciar sesión con código y NIP, consultar información académica y acceder a recursos externos como el directorio y videos informativos.

> **Nota:** Esta app consume servicios externos que no son de mi autoría.  
> El código de la app sí es propio, pero el backend y algunas páginas embebidas pertenecen a terceros.

---

## Funcionalidades

- Pantalla de **login** con código y NIP, con persistencia de sesión y auto-skip si ya hay sesión guardada.
- **Modo demo** para probar la app sin necesidad del backend real.
- Visualización de:
  - Información del alumno (perfil, carrera, situación).
  - Información académica (kárdex, materias por ciclo, créditos, calificaciones).
- **Directorio** de CUCEI embebido en WebView.
- Sección de **videos** (contenido hosteado externamente).
- **Mapa interactivo del campus**:
  - Hotspots sobre edificios y módulos.
  - Cada hotspot abre un modal con galería de fotos y descripción.
  - Orientación bloqueada en horizontal para mejor visualización.

---

## Stack tecnológico

- [React Native 0.81](https://reactnative.dev/)
- [Expo SDK 54](https://expo.dev/)
- [React Navigation v7](https://reactnavigation.org/)
- [react-native-webview](https://github.com/react-native-webview/react-native-webview)
- [AsyncStorage](https://github.com/react-native-async-storage/async-storage)
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- ESLint con plugins de React y React Hooks

---

## Estructura del proyecto

```text
campus-cucei-app/
├── src/
│   ├── screens/
│   │   ├── Principal.js       # Pantalla de inicio con accesos principales
│   │   ├── Login.js           # Autenticación con código y NIP
│   │   ├── PerfilAlumno.js    # Perfil e información académica del alumno
│   │   ├── KardexAlumno.js    # Kárdex con materias agrupadas por ciclo
│   │   ├── Directorio.js      # Directorio embebido en WebView
│   │   ├── Video.js           # Video institucional embebido
│   │   └── MapaLite.js        # Mapa interactivo del campus
│   └── services/
│       └── authService.js     # Lógica de autenticación, sesión y parseo
├── assets/                    # Imágenes y recursos estáticos
├── App.js                     # Punto de entrada
├── Menu.js                    # Navegación principal (stack)
├── config.js                  # URLs y configuración de endpoints
├── eslint.config.js           # Configuración de ESLint
└── .github/workflows/ci.yml   # CI con ESLint en cada push
```

---

## Instalación y ejecución

**Requisitos:** Node.js 18+, Expo CLI, app Expo Go en el teléfono o emulador Android/iOS.

```bash
git clone https://github.com/AlanGlzQ/campus-cucei-app.git
cd campus-cucei-app
npm install --legacy-peer-deps
npx expo start
```

Escanea el QR con Expo Go o ejecuta en emulador.

### Modo demo

En `config.js`, `USE_MOCK_AUTH` está en `true` por defecto — la app funciona con datos de ejemplo sin necesidad del backend real. Cámbialo a `false` para usar el backend de CUCEI.

```js
export const USE_MOCK_AUTH = true; // false en producción
```

---

## Demo en video

[[Demo CampusCucei]](https://drive.google.com/file/d/1BUcxZBWQS5o8fPSMrI4n87ukulmyjMwg/view?usp=sharing)

---

## Estado del proyecto

Desarrollado como proyecto escolar/personal. No está pensado como aplicación de producción — el backend y algunos recursos externos pueden cambiar o dejar de estar disponibles.

El código del frontend (esta app) es de mi autoría.
