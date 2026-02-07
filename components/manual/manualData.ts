
import { CardData } from './ManualCard';
import { CodeBlockData } from './ManualCodeBlock';

export interface ManualSubsection {
    title: string;
    content: string;
    cards?: CardData[];
    codeBlocks?: CodeBlockData[];
}

export interface ManualSection {
  id: string;
  title: string;
  content: string;
  subsections: ManualSubsection[];
}

export const manualSections: ManualSection[] = [
  {
    id: 'introduccion',
    title: 'Introducción',
    content: 'Impostor 9.0 es un juego de deducción social diseñado para grupos de 3 a 20 jugadores. La app asigna roles secretos y gestiona la partida de forma inteligente.',
    subsections: [
      {
        title: '¿Qué es Impostor 9.0?',
        content: 'Basado en el clásico "Undercover", la app asigna roles secretos a cada jugador: la mayoría recibe la palabra Civil, mientras que uno o más jugadores reciben el rol de Impostor con una pista relacionada.',
        cards: [
          {
            type: 'highlight',
            title: 'Lo Que Hace Especial a Impostor 9.0',
            content: [
              '🧠 Motor INFINITUM - IA que aprende de cada partida',
              '🎲 Protocolos de Crisis - Sistemas que detectan patrones',
              '🎭 Modos Adaptativos - Más de 8 modos de juego dinámicos',
              '📊 Transparencia Total - Sistema de telemetría completo'
            ]
          }
        ]
      }
    ]
  },
  
  {
    id: 'reglas',
    title: 'Reglas Básicas',
    content: 'Aprende cómo se juega Impostor 9.0 paso a paso, desde la configuración hasta la votación final.',
    subsections: [
      {
        title: 'Configuración Inicial',
        content: 'Introduce los nombres de los jugadores (3-20). Selecciona el número de impostores. Recomendamos usar la proporción 20-30% de impostores sobre el total.',
        cards: [
          {
            type: 'info',
            title: 'Recomendación',
            content: 'Para grupos de 3 a 6 jugadores, usa 1 impostor. Para grupos de 7 a 12, usa 2 impostores.'
          }
        ]
      },
      {
        title: 'Flujo de la Partida',
        content: 'La partida se divide en varias fases clave: Revelación, Descripción, Discusión y Votación.',
        codeBlocks: [
          {
            title: 'Ejemplo de Descripción',
            content: `Palabra: PIZZA

Civil 1: "Tiene queso y tomate"
Civil 2: "Es redonda normalmente"
Impostor: "Se come en grupo" (intentando pasar desapercibido)
Civil 3: "Tiene masa horneada"`
          }
        ]
      },
      {
        title: 'Condiciones de Victoria',
        content: 'Los Civiles ganan si eliminan a todos los impostores. Los Impostores ganan si no son eliminados tras las rondas pactadas o si quedan en igual número que los civiles.'
      }
    ]
  },

  {
    id: 'roles',
    title: 'Roles del Juego',
    content: 'Además de Civiles e Impostores, existen roles especiales que añaden profundidad estratégica.',
    subsections: [
      {
        title: 'Civil',
        content: 'Conoce la palabra secreta. Debe describir sin ser obvio para no ayudar al impostor, pero lo suficiente para que otros civiles le reconozcan.',
        cards: [
            {
                type: 'success',
                title: 'Estrategia Civil',
                content: 'Haz preguntas cerradas y busca inconsistencias en las historias de los demás.'
            }
        ]
      },
      {
        title: 'Impostor',
        content: 'No conoce la palabra (recibe una pista o nada). Debe aparentar ser civil y deducir la palabra escuchando.',
        cards: [
            {
                type: 'danger',
                title: 'Estrategia Impostor',
                content: 'Sé genérico al principio. Copia el estilo de los demás pero no sus palabras exactas.'
            }
        ]
      },
      {
        title: 'Arquitecto',
        content: 'Un civil especial que elige la palabra de la ronda entre dos opciones. Nadie sabe quién es.',
        cards: [
            {
                type: 'highlight',
                title: 'Poder del Arquitecto',
                content: 'Puede elegir una palabra que le resulte fácil o difícil según la estrategia del grupo.'
            }
        ]
      },
      {
        title: 'Oráculo',
        content: 'Un civil que ve las posibles pistas del impostor y debe leer una en voz alta para condicionar la partida.',
        cards: [
            {
                type: 'info',
                title: 'Función del Oráculo',
                content: 'Ayuda a calibrar la dificultad dando contexto extra a todos los jugadores.'
            }
        ]
      }
    ]
  },

  {
    id: 'infinitum',
    title: 'Sistema INFINITUM',
    content: 'El motor matemático que garantiza la justicia estadística a largo plazo.',
    subsections: [
      {
        title: 'La Bóveda de Infinidad',
        content: 'Cada jugador tiene un perfil persistente que guarda su historial: veces que ha sido impostor, racha de civil, etc.',
      },
      {
        title: 'Cálculo de Peso',
        content: 'El sistema calcula la probabilidad de ser impostor basándose en la "Racha de Civil" (Karma) y la frecuencia histórica.',
        codeBlocks: [
            {
                title: 'Ecuación Simplificada',
                content: 'Peso = 100 * log(Racha + 2) * (1 / Ratio_Impostor)'
            }
        ]
      },
      {
        title: 'Protocolos de Crisis',
        content: 'Si el sistema detecta patrones predecibles (Paranoia alta), activa medidas de emergencia como el Protocolo Leteo (borrado de memoria) o Pandora (caos).',
        cards: [
            {
                type: 'warning',
                title: 'Factor Paranoia',
                content: 'Mide qué tan predecible es la selección. Si supera el 70%, se activan eventos especiales.'
            }
        ]
      }
    ]
  },

  {
    id: 'modos',
    title: 'Modos de Juego',
    content: 'Personaliza tu experiencia con diferentes modificadores.',
    subsections: [
      {
        title: 'Modo Pista',
        content: 'Los impostores reciben una pista relacionada en lugar de "Eres el Impostor". Recomendado para principiantes.',
      },
      {
        title: 'Modo Troll (Pandora)',
        content: 'Eventos caóticos ultra raros. Puede ocurrir un "Espejo Total" (todos impostores) o "Civil Solitario". No afectan a las estadísticas.',
      },
      {
        title: 'Modo Party (Bacchus)',
        content: 'Añade roles sociales como el Bartender (quien manda beber) o el VIP. Incluye castigos y retos de bebida.',
      },
      {
        title: 'Modo Renuncia',
        content: 'Permite a un impostor rechazar su rol (convirtiéndose en civil) o transferirlo a otro jugador sin saber a quién.',
        cards: [
            {
                type: 'highlight',
                title: 'Decisión Crítica',
                content: 'Si rechazas, habrá menos impostores. Si transfieres, creas un "Testigo" que sabe que hubo un cambio.'
            }
        ]
      }
    ]
  },

  {
    id: 'protocolos',
    title: 'Protocolos Avanzados',
    content: 'Mecánicas profundas para jugadores expertos.',
    subsections: [
        {
            title: 'Protocolo Vanguardia',
            content: 'Si el jugador que empieza la ronda es un Impostor, recibe DOS pistas en lugar de una para ayudarle a arrancar.',
        },
        {
            title: 'Protocolo Nexus',
            content: 'Si hay múltiples impostores, pueden ver quiénes son sus compañeros en la carta de identidad.',
            cards: [
                {
                    type: 'success',
                    title: 'Sinergia',
                    content: 'Permite estrategias de equipo, como sacrificios o defensas mutuas.'
                }
            ]
        },
        {
            title: 'Protocolo Vocalis',
            content: 'El sistema elige quién empieza la ronda basándose en quién ha hablado menos recientemente.'
        }
    ]
  },

  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    content: 'Respuestas a las dudas más comunes.',
    subsections: [
        {
            title: 'General',
            content: '¿Se necesita internet? No, funciona offline. ¿Se guardan los datos? Sí, en el dispositivo.',
        },
        {
            title: 'Sobre INFINITUM',
            content: '¿El juego me tiene manía? No, el sistema busca el equilibrio matemático a largo plazo. Si has sido impostor mucho, tardarás en volver a serlo.',
        },
        {
            title: 'Modo Debug',
            content: 'Toca 5 veces el título "IMPOSTOR" en la pantalla de inicio para ver las probabilidades y estadísticas ocultas.',
            codeBlocks: [
                {
                    title: 'Acceso Debug',
                    content: 'Setup -> Tocar título 5 veces -> Vibración de confirmación'
                }
            ]
        }
    ]
  }
];
