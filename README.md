<div align="center">

<img width="1200" height="475" alt="Impostor 9.0 Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🕵️ Impostor 9.0

**El juego de mesa digital para descubrir al impostor entre tus amigos.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 📖 ¿Qué es Impostor 9.0?

Impostor 9.0 es una **aplicación web progresiva (PWA)** para jugar al clásico juego del impostor en grupo. Cada jugador recibe en secreto una palabra o rol. La mayoría conoce la palabra real, pero uno o varios jugadores son **impostores** que no la conocen y deben ocultarlo. Al final, el grupo debate y vota para descubrir quién miente.

Diseñado para jugarse **en el mismo dispositivo**, pasando el teléfono de mano en mano, con soporte para grupos de 3 a 12+ jugadores.

---

## ✨ Características principales

- 🎭 **Múltiples modos de juego** — Clásico, Party Mode, Magistrado, Arquitecto, Oráculo y Renuncia
- 🃏 **Más de 500 categorías** — Desde películas y series hasta gastronomía, deportes y cultura pop
- 🎨 **Temas visuales** — Luminous, Aura y más, con transiciones animadas
- 📱 **PWA instalable** — Funciona en móvil como app nativa, con soporte offline
- 🔊 **Sistema de audio** — Efectos de sonido y control de volumen integrado
- 🏆 **Historial y estadísticas** — Seguimiento de partidas y puntuaciones por jugador
- 🧩 **Categorías personalizadas** — Añade tus propias palabras y categorías
- 🃏 **Animación de barajado** — Transición visual al iniciar partida
- 🐣 **Easter egg** — Código Konami oculto para desbloquear el modo Centinela Legendary
- 🛠️ **Debug Console** — Herramienta avanzada para testear y forzar estados del juego

---

## 🎮 Modos de juego

| Modo | Descripción |
|------|-------------|
| **Clásico** | Un impostor sin conocer la palabra, el grupo lo descubre |
| **Party Mode** | Prompts de bebida y eventos especiales durante la partida |
| **Magistrado** | Un jugador actúa como árbitro con poderes especiales al final |
| **Arquitecto** | Un jugador puede elegir/modificar la palabra antes de que empiece |
| **Oráculo** | El impostor puede obtener pistas limitadas antes del debate |
| **Renuncia** | El impostor puede rendirse a mitad de partida a cambio de puntos parciales |

---

## 🚀 Instalación y uso local

### Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/javirerffggg/Impostor-9.0.git
cd Impostor-9.0

# 2. Instala las dependencias
npm install

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción (TypeScript + Vite)
npm run preview  # Preview del build de producción
```

---

## 🏗️ Estructura del proyecto

```
Impostor-9.0/
├── components/             # Componentes React
│   ├── views/              # Vistas principales (Setup, Revealing, Results, Oracle)
│   ├── manual/             # Sección "Cómo se juega"
│   ├── IdentityCard.tsx    # Carta de identidad del jugador
│   ├── SwipeRevealCard.tsx # Revelación con swipe gesture
│   ├── SettingsDrawer.tsx  # Drawer de ajustes
│   ├── CategorySelector.tsx# Selector de categorías
│   ├── DebugConsole.tsx    # Consola de debug (dev)
│   └── ...
├── hooks/
│   ├── useGameState.ts     # Estado principal del juego
│   ├── useAudioSystem.ts   # Sistema de audio
│   └── usePartyPrompts.ts  # Prompts del modo Party
├── categories.ts           # Categorías base del juego
├── customCategories*.ts    # Categorías extendidas (partes 1–7)
├── constants.ts            # Temas, colores y constantes globales
├── types.ts                # Tipos TypeScript del proyecto
├── App.tsx                 # Componente raíz
├── index.tsx               # Punto de entrada
├── sw.js                   # Service Worker (PWA)
└── manifest.json           # Web App Manifest (PWA)
```

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| React 18 | UI y gestión de estado |
| TypeScript 5 | Tipado estático |
| Vite 5 | Build tool y dev server |
| Tailwind CSS 3 | Estilos utilitarios |
| @dnd-kit | Drag & drop en listas de jugadores |
| canvas-confetti | Efectos de celebración |
| lucide-react | Iconografía |
| vite-plugin-pwa | Generación de Service Worker y Manifest |

---

## 📱 Instalación como PWA

En Chrome/Edge (móvil o escritorio):
1. Abre la app en el navegador
2. Pulsa el icono de **"Instalar app"** en la barra de direcciones
3. Confirma la instalación

La app funcionará sin conexión a internet una vez instalada.

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Commitea tus cambios: `git commit -m 'feat: añadir nueva funcionalidad'`
4. Push a tu rama: `git push origin feature/mi-mejora`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados © 2026 javirerffggg.
