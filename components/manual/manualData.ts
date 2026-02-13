
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
        content: 'Basado en el clásico "Undercover", la app asigna roles secretos a cada jugador: la mayoría recibe la palabra Civil, mientras que uno o más jugadores reciben el rol de Impostor con una pista relacionada. El objetivo es descubrir quién es el impostor a través de conversación, debate y votaciones.',
        cards: [
          {
            type: 'highlight',
            title: 'Lo Que Hace Especial a Impostor 9.0',
            content: [
              '🧠 Motor INFINITUM: IA que aprende de cada partida',
              '🎲 Protocolos de Crisis: Sistemas que detectan patrones',
              '🎭 Modos Adaptativos: Más de 8 modos de juego dinámicos',
              '📊 Transparencia Total: Sistema de telemetría completo'
            ]
          }
        ]
      },
      {
        title: 'Controles Táctiles',
        content: 'Cómo interactuar con las pantallas del juego.',
        cards: [
          {
            type: 'info',
            title: 'Gestos Principales',
            content: [
              '👆 MANTENER: Para revelar tu carta de identidad',
              '👈 SWIPE: Para pasar a la siguiente persona',
              '🔒 MANTENER (Resultados): Para desbloquear la pantalla final',
              '↕️ ARRASTRAR: Para reordenar jugadores en setup (mantén el icono ≡)'
            ]
          }
        ]
      },
      {
        title: 'Índice de Temas Populares',
        content: 'Accesos directos a las preguntas más comunes:',
        cards: [
          {
            type: 'info',
            title: 'Busco...',
            content: [
              '🔍 "¿Cómo funciona el impostor?" → Ver: Roles > Impostor',
              '🔍 "¿Por qué siempre me toca?" → Ver: Sistema INFINITUM',
              '🔍 "¿Cómo activo modos?" → Ver: Configuración > Ajustes Avanzados',
              '🔍 "¿Qué es el Magistrado?" → Ver: Roles > Magistrado',
              '🔍 "Estrategias para ganar" → Ver: Estrategias y Consejos'
            ]
          }
        ]
      },
      {
        title: 'Momentos Épicos de la Comunidad',
        content: 'Historias reales de jugadores que han vivido situaciones inolvidables.',
        cards: [
          {
            type: 'highlight',
            title: '🏆 La Gran Traición',
            content: 'Un jugador transfirió su rol de impostor en el último segundo. El nuevo impostor era su mejor amigo, quien lo acusó inmediatamente para ganar credibilidad. Nadie lo vio venir.'
          },
          {
            type: 'success',
            title: '🎭 El Fantasma',
            content: 'Un Testigo Silencioso guardó su secreto hasta el final. Cuando acusó al impostor correcto, nadie le creyó... hasta que los resultados lo confirmaron.'
          },
          {
            type: 'danger',
            title: '💥 El Caos del Troll',
            content: 'Protocolo Pandora activado: todos eran impostores. El grupo pasó 15 minutos acusándose sin entender qué pasaba. Cuando se reveló, fue la risa más grande de la noche.'
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
        content: '1. Agregar Jugadores: Introduce los nombres (3-20 jugadores).\n2. Seleccionar Impostores: Elige cuántos infiltrados habrá.\n3. Elegir Categorías: Selecciona los temas de las palabras.\n4. Activar Modos: Configura las opciones especiales.',
        cards: [
          {
            type: 'info',
            title: 'Recomendación de Impostores',
            content: [
              '1 Impostor: 3-6 jugadores',
              '2 Impostores: 7-12 jugadores',
              '3+ Impostores: 13+ jugadores (Caos controlado)'
            ]
          }
        ]
      },
      {
        title: 'Flujo de la Partida',
        content: 'FASE 1: Revelación. Pasa el dispositivo para que cada uno vea su rol secreto.\nFASE 2: Descripción. El jugador designado inicia. Cada uno dice una palabra o frase relacionada.\nFASE 3: Discusión. Debate abierto para buscar sospechosos.\nFASE 4: Votación y Resolución.',
        codeBlocks: [
          {
            title: 'Ejemplo de Ronda',
            content: `Palabra: PIZZA

- Civil 1: "Tiene queso y tomate"
- Civil 2: "Es redonda normalmente"
- Impostor: "Se come en grupo" (Pista genérica)
- Civil 3: "Tiene masa horneada"`
          }
        ]
      },
      {
        title: 'Condiciones de Victoria',
        content: 'Victoria Civil: Eliminan a todos los impostores mediante votación.\nVictoria Impostor: No son eliminados tras las rondas pactadas o adivinan la palabra secreta al final (opcional).',
        cards: [
            {
                type: 'warning',
                title: 'Importante',
                content: 'Nadie debe ver la carta de otro jugador durante la fase de revelación.'
            }
        ]
      }
    ]
  },

  {
    id: 'ejemplos',
    title: 'Ejemplos de Partidas',
    content: 'Aprende viendo cómo se desarrollan partidas reales con diferentes modos activados.',
    subsections: [
      {
        title: 'Partida Clásica (4 jugadores, 1 impostor)',
        content: 'Palabra: MÓVIL\n\nJugadores: Ana (Civil), Luis (Impostor), Marta (Civil), Carlos (Civil Arquitecto)\n\n**RONDA DE DESCRIPCIONES:**\n- Carlos: "Lo usas todos los días"\n- Ana: "Tiene pantalla táctil"\n- Luis: "Se carga con cable" (pista: dispositivo electrónico)\n- Marta: "Tiene aplicaciones y cámara"\n\n**ANÁLISIS:** Luis fue demasiado genérico. Todos votaron por él.\n\n**RESULTADO:** Victoria Civil.',
        cards: [
          {
            type: 'info',
            title: 'Lección',
            content: 'Como impostor, sé específico después de escuchar suficientes pistas. "Tiene pantalla" habría sido mejor que "se carga".'
          }
        ]
      },
      {
        title: 'Partida con Nexus (6 jugadores, 2 impostores)',
        content: 'Palabra: PIZZA\n\nImpostores con Nexus saben que ambos son cómplices.\n\n**ESTRATEGIA COORDINADA:**\n- Impostor 1 acusa sutilmente a un civil\n- Impostor 2 "defiende" al civil pero planta duda\n- Resultado: Dividen al grupo',
        cards: [
          {
            type: 'success',
            title: 'Sinergia',
            content: 'Nexus permite juegos mentales avanzados. Coordinaos con miradas o patrones de voto.'
          }
        ]
      },
      {
        title: 'Partida con Renuncia Activada (5 jugadores)',
        content: 'Impostor original: Pedro\n\nPedro ve su carta de impostor pero activa "TRANSFERIR".\n\nAhora Pedro es Testigo Silencioso (sabe que hubo cambio).\nEl nuevo impostor es María (no sabe que Pedro lo sabe).\n\n**DRAMA:** Pedro puede acusar sabiendo que hay impostor, pero sin saber quién.',
        cards: [
          {
            type: 'danger',
            title: 'Riesgo',
            content: 'Si transfieres, pierdes el control pero ganas información única. Úsalo tácticamente.'
          }
        ]
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
                title: 'Estrategia',
                content: 'Haz preguntas cerradas y busca inconsistencias en las historias de los demás. No digas la palabra directamente.'
            }
        ]
      },
      {
        title: 'Impostor',
        content: 'No conoce la palabra (recibe una pista o nada). Debe aparentar ser civil y deducir la palabra escuchando las descripciones de los demás.',
        cards: [
            {
                type: 'danger',
                title: 'Estrategia',
                content: 'Sé genérico al principio. Copia el estilo de los demás pero no sus palabras exactas. Acusa a otros para desviar sospechas.'
            }
        ]
      },
      {
        title: 'Arquitecto (Protocolo Architect)',
        content: 'Un civil especial que tiene acceso temporal a información privilegiada antes de que comience la ronda. Elige cuál será la palabra de la ronda entre dos opciones. Nadie sabe quién es.',
        cards: [
            {
                type: 'highlight',
                title: 'Ventaja',
                content: 'Puede elegir una palabra que favorezca al grupo. Tiene certeza absoluta de no ser impostor.'
            }
        ]
      },
      {
        title: 'Magistrado (Protocolo Magistrado)',
        content: 'Un civil especial elegido aleatoriamente que actúa como "alcalde" de la partida. Su voto cuenta doble en la votación final. Solo se activa con 6+ jugadores.',
        cards: [
          {
            type: 'highlight',
            title: 'Responsabilidad',
            content: [
              '🗳️ Voto Doble: Su decisión tiene el doble de peso',
              '⚖️ Árbitro Natural: Debe mantener el orden en el debate',
              '👁️ Blanco Fácil: Los impostores pueden intentar desacreditarle',
              '💡 Estrategia: No reveles tu identidad prematuramente'
            ]
          },
          {
            type: 'warning',
            title: 'Activación',
            content: 'Requiere mínimo 6 jugadores y debe activarse en los ajustes del modo "Protocolos".'
          }
        ]
      },
      {
        title: 'Oráculo (Protocolo Oráculo)',
        content: 'Un civil especial que puede dar una pista mejorada a los demás civiles. Ve posibles pistas y lee una en voz alta antes de que el impostor vea su carta.',
        cards: [
            {
                type: 'info',
                title: 'Función',
                content: 'Permite "calibrar" el nivel de dificultad de la ronda en tiempo real dando contexto extra.'
            }
        ]
      },
      {
        title: 'Vanguardia (Protocolo Vanguardia)',
        content: 'Un impostor especial que recibe dos pistas en lugar de una. Solo se activa si el Iniciador de la ronda es un impostor.',
        cards: [
            {
                type: 'warning',
                title: 'Poder',
                content: 'Le da más información para hacer descripciones creíbles al tener que hablar primero.'
            }
        ]
      },
      {
        title: 'Testigo Silencioso (Protocolo Renuncia)',
        content: 'Si usas TRANSFERIR en el Protocolo Renuncia, te conviertes en un Testigo Silencioso durante esa ronda.',
        cards: [
          {
            type: 'highlight',
            title: 'Características',
            content: [
              '✅ Sabes que EXISTE un impostor (certeza)',
              '❌ NO sabes quién es el nuevo impostor',
              '🎭 Puedes acusar con más confianza que otros civiles',
              '⚠️ Si acusas mal, perderás credibilidad',
              '💡 Tu palabra secreta sigue siendo la del civil'
            ]
          },
          {
            type: 'warning',
            title: 'Estrategia',
            content: 'Observa quién actúa más nervioso. Tú sabes que hubo un cambio, así que busca comportamiento extraño.'
          }
        ]
      },
      {
        title: 'Nexus (Protocolo Nexus)',
        content: 'Los impostores pueden ver la identidad de sus compañeros durante la revelación de cartas. Solo si hay 2+ impostores.',
        cards: [
            {
                type: 'success',
                title: 'Sinergia',
                content: 'Permite coordinarse sutilmente, apoyarse en descripciones o evitar acusarse accidentalmente.'
            }
        ]
      },
      {
        title: 'Roles del Modo Party',
        content: 'Bartender: Inicia la ronda e introduce caos. VIP: Jugador con mayor racha de civil. Alguacil: Jugador con más victorias como impostor.',
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
        content: 'Cada jugador tiene un perfil persistente que almacena su historial: total de sesiones, ratio de impostor, racha de civil (Karma), historial de roles, afinidad de categoría y compañeros previos.',
      },
      {
        title: 'Cálculo de Peso',
        content: 'INFINITUM calcula un "peso" para cada jugador. Alta racha de civil y bajo ratio de impostor aumentan la probabilidad. Haber sido impostor recientemente la reduce drásticamente.',
        codeBlocks: [
            {
                title: 'Ecuación Simplificada',
                content: 'Peso Base = 100 × log(Racha + 2) × (1 / Ratio)\n\nRecencia:\n- Última ronda: Peso × 0.05\n- Hace 2 rondas: Peso × 0.30'
            }
        ]
      },
      {
        title: 'Protocolos de Crisis',
        content: 'Sistemas de emergencia que se activan cuando detecta anomalías o patrones predecibles.',
        cards: [
            {
                type: 'danger',
                title: 'Tipos de Crisis',
                content: [
                    '🌀 Protocolo Leteo: Borra memoria del sistema para romper patrones.',
                    '🎭 Protocolo Pandora: Activa eventos caóticos (Modo Troll).',
                    '🔄 Protocolo Espejo: Invierte las probabilidades (el menos probable es elegido).',
                    '👁️ Protocolo Ciego: Selección totalmente aleatoria.'
                ]
            }
        ]
      },
      {
        title: 'Factor Paranoia',
        content: 'Mide (0-100%) qué tan predecible ha sido la selección. Si supera el 70%, se activa una crisis. Factores: secuencias lineales, repetición de jugadores o parejas.',
      }
    ]
  },

  {
    id: 'modos',
    title: 'Modos de Juego',
    content: 'Personaliza tu experiencia activando diferentes modos en los ajustes.',
    subsections: [
      {
        title: 'Comparativa Rápida de Modos',
        content: 'Tabla que te ayuda a decidir qué activar según tu grupo.',
        cards: [
          {
            type: 'highlight',
            title: 'Guía de Activación',
            content: [
              '🟢 Principiantes → Modo Pista + Arquitecto',
              '🟡 Intermedios → Pista + Oráculo + Nexus',
              '🔴 Expertos → Sin Pista + Troll + Vanguardia + Renuncia',
              '🍺 Fiesta → Party + Troll + Oráculo',
              '🧠 Hardcore → Memoria (Difícil) + Sin Pista + Troll'
            ]
          }
        ]
      },
      {
        title: 'Modo Pista',
        content: 'Los impostores reciben una pista relacionada con la palabra secreta en lugar de "ERES EL IMPOSTOR". Recomendado para principiantes o grupos casuales.',
      },
      {
        title: 'Modo Troll (Protocolo Pandora)',
        content: 'Eventos caóticos ultra raros que rompen las reglas. Ocurren con baja probabilidad (~5-10%).',
        cards: [
            {
                type: 'warning',
                title: 'Eventos Posibles',
                content: [
                    '🪞 Espejo Total: ¡Todos son impostores!',
                    '👤 Civil Solitario: Solo un civil, el resto impostores.',
                    '✨ Falsa Alarma: Todos son civiles.'
                ]
            }
        ]
      },
      {
        title: 'Modo Memoria (Protocolo Mnemosyne)',
        content: 'Sustituye la carta de identidad estática por un desafío de memoria efímero. Los jugadores verán una lista de palabras durante unos segundos y deben memorizar la correcta. El Impostor solo verá palabras falsas (distractores).',
        cards: [
            {
                type: 'highlight',
                title: 'Reto Cognitivo',
                content: 'Si el Impostor falla al recordar una palabra falsa coherente, será descubierto. Configurable en ajustes (Tiempo, Cantidad de palabras).'
            }
        ]
      },
      {
        title: 'Modo Arquitecto',
        content: 'Un civil aleatorio recibe el poder de elegir la palabra de la ronda. Aumenta la estrategia.',
      },
      {
        title: 'Modo Oráculo',
        content: 'Un civil puede dar una pista en voz alta antes de que el primer impostor vea su carta. Equilibra la dificultad.',
      },
      {
        title: 'Modo Vanguardia',
        content: 'Si el iniciador es impostor, recibe dos pistas. Compensa la desventaja de empezar.',
      },
      {
        title: 'Modo Nexus',
        content: 'Los impostores conocen la identidad de sus compañeros. Permite juego en equipo.',
      },
      {
        title: 'Modo Party (Protocolo Bacchus)',
        content: 'Añade roles sociales (Bartender, VIP) y castigos de bebida. Ideal para fiestas.',
      },
      {
        title: 'Protocolo Renuncia',
        content: 'Un impostor puede alterar su destino antes de revelar su carta: Aceptar, Rechazar (ser civil) o Transferir (pasar el rol a otro sin saber a quién).',
        cards: [
            {
                type: 'highlight',
                title: 'Dinámica',
                content: 'Si transfieres, te conviertes en un "Testigo Silencioso" que sabe que hubo un cambio pero no conoce al nuevo impostor.'
            }
        ]
      }
    ]
  },

  {
    id: 'logros',
    title: 'Logros y Desafíos',
    content: 'Objetivos secretos que desbloquear jugando. (Próximamente en v11.0)',
    subsections: [
      {
        title: 'Logros de Supervivencia',
        content: 'Colecciona estos hitos durante tu carrera como jugador.',
        cards: [
          {
            type: 'success',
            title: 'Ejemplos',
            content: [
              '🛡️ Inamovible: 10 partidas como civil seguidas',
              '👑 Maestro del Engaño: Ganar 5 veces como impostor',
              '🎭 Camaleón: Sobrevivir siendo impostor sin pistas',
              '🔥 Racha Imposible: 20 sesiones sin ser impostor',
              '💀 Némesis: Eliminar correctamente a 10 impostores'
            ]
          }
        ]
      },
      {
        title: 'Desafíos Semanales',
        content: 'Retos limitados en el tiempo que recompensan con insignias.',
        cards: [
          {
            type: 'highlight',
            title: 'Esta Semana',
            content: [
              '🎯 El Silencioso: Gana sin hablar más de 5 palabras',
              '🧠 Memoria Perfecta: Completa 3 rondas en Modo Memoria sin fallar',
              '🍺 Fiestero: Juega 10 rondas en Modo Party'
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'categorias',
    title: 'Categorías y Palabras',
    content: 'El banco de datos del juego incluye más de 50 categorías clasificadas.',
    subsections: [
      {
        title: 'Tipos de Categorías',
        content: 'Concretas (Fácil): Objetos, Animales.\nAbstractas (Medio): Emociones, Profesiones.\nComplejas (Difícil): Películas, Conceptos científicos.',
      },
      {
        title: 'Gestión de Palabras',
        content: 'El sistema evita repetir palabras usadas recientemente y pondera las palabras menos usadas para que aparezcan más.',
      },
      {
        title: 'Modos de Selección',
        content: 'Omnisciente (Todas las categorías), Temático (Selección específica) o Único (Una sola categoría).',
      }
    ]
  },

  {
    id: 'configuracion',
    title: 'Configuración y Ajustes',
    content: 'Opciones disponibles en el menú de Setup y Ajustes.',
    subsections: [
      {
        title: 'Pantalla de Setup',
        content: 'Permite añadir/quitar jugadores, seleccionar el número de impostores y elegir categorías.',
      },
      {
        title: 'Ajustes Avanzados',
        content: 'Activa/desactiva modos (Pista, Troll, Party...), configura temporizadores, sonidos y el sistema INFINITUM.',
      },
      {
        title: 'Modo Debug',
        content: 'Herramienta para desarrolladores o curiosos. Muestra las entrañas del sistema.',
        codeBlocks: [
            {
                title: 'Cómo Activar',
                content: 'En la pantalla de título, toca el logo "IMPOSTOR" 5 veces rápido.\nVerás "DEBUG MODE ENABLED".'
            }
        ]
      }
    ]
  },

  {
    id: 'estrategias',
    title: 'Estrategias y Consejos',
    content: 'Tácticas para mejorar tu juego en ambos bandos.',
    subsections: [
      {
        title: 'Para Civiles',
        content: 'Sé específico pero no obvio. Observa quién copia descripciones. Haz preguntas cerradas ("¿Es comida?"). Busca contradicciones.',
        cards: [
            {
                type: 'success',
                title: 'Técnica del Ancla',
                content: 'Si el primero es muy general, observa quién copia ese estilo vago.'
            }
        ]
      },
      {
        title: 'Para Impostores',
        content: 'Sé genérico al principio. Escucha activamente palabras clave. Copia el estilo, no las palabras exactas. Acusa con confianza sutil.',
        cards: [
            {
                type: 'danger',
                title: 'Técnica del Eco',
                content: 'Repite un patrón común que hayas escuchado pero con diferentes palabras.'
            }
        ]
      },
      {
        title: 'Para el Arquitecto',
        content: 'Elige según la experiencia del grupo. Nunca reveles tu identidad. Usa tu certeza de civil para acusar agresivamente.',
      },
      {
        title: 'Estrategias de Grupo',
        content: 'Sistema de Votación Justa (defensa en empate), Regla de Dos Rondas (más información), Modo Silencioso (solo gestos).',
      }
    ]
  },

  {
    id: 'troubleshooting',
    title: 'Solución de Problemas',
    content: 'Qué hacer cuando algo no funciona como esperabas.',
    subsections: [
      {
        title: 'Problemas Comunes',
        content: 'Lista de errores frecuentes y sus soluciones.',
        cards: [
          {
            type: 'warning',
            title: '🔴 La app se cierra sola',
            content: 'Solución: Limpia la caché del navegador o reinstala la PWA. Si persiste, desactiva Modo Memoria.'
          },
          {
            type: 'warning',
            title: '🔴 No guarda mi progreso',
            content: 'Solución: Verifica que las cookies estén habilitadas. El juego usa localStorage para guardar.'
          },
          {
            type: 'warning',
            title: '🔴 El drag & drop no funciona en móvil',
            content: 'Solución: Mantén presionado el icono ≡ durante 0.5s antes de arrastrar. Si sigue fallando, desactiva gestos del navegador.'
          },
          {
            type: 'warning',
            title: '🔴 Pantalla blanca después de actualizar',
            content: 'Solución: Fuerza la recarga (Ctrl+Shift+R en escritorio, o limpia caché en móvil).'
          }
        ]
      },
      {
        title: 'Contacto y Reportar Bugs',
        content: 'Si encuentras un problema no listado aquí:',
        cards: [
          {
            type: 'info',
            title: 'Cómo Reportar',
            content: [
              '📧 Email: bugs@impostor9.app (ficticio)',
              '🐛 GitHub: github.com/javirerffggg/Impostor-9.0/issues',
              '💬 Discord: discord.gg/impostor9 (ficticio)',
              '📸 Adjunta: Captura + pasos para reproducir + dispositivo'
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'faq',
    title: 'Preguntas Frecuentes',
    content: 'Solución a dudas comunes.',
    subsections: [
        {
            title: 'Generales',
            content: '¿Mínimo de jugadores? 3. ¿Duración? 5-15 min/ronda. ¿Internet? No necesario. ¿Guardado? Automático.',
        },
        {
            title: 'Sobre INFINITUM',
            content: '¿Me tiene manía? No, busca equilibrio. Si has sido impostor mucho, tu probabilidad baja. Si nunca lo has sido, sube.',
        },
        {
            title: 'Sobre el Protocolo Renuncia',
            content: '¿Saben los demás que renuncié? No. ¿Si transfiero, sé a quién? No, es ciego.',
        },
        {
            title: 'Técnicas',
            content: '¿Puedo mentir? Sí, sobre todo si eres impostor. ¿Puedo buscar en Google? No, arruina el juego.',
        },
        {
          title: 'Comportamientos Confusos Explicados',
          content: 'Cosas que parecen bugs pero son intencionales.',
          cards: [
            {
              type: 'info',
              title: 'No es un bug',
              content: [
                '✓ "Siempre me toca a mí": INFINITUM corrige desequilibrios, no es aleatorio puro',
                '✓ "No puedo añadir más de 20 jugadores": Límite de diseño para mantener el ritmo',
                '✓ "El timer sigue después de revelar": Es para presión psicológica intencional',
                '✓ "No veo mis estadísticas": Usa Debug Mode para ver datos (toca logo 5 veces)'
              ]
            }
          ]
        }
    ]
  },

  {
    id: 'changelog',
    title: 'Historial de Versiones',
    content: 'Registro de cambios y mejoras del sistema.',
    subsections: [
      {
        title: 'v10.0 - Magistrado & Memoria',
        content: 'Febrero 2026\n\n• Nuevo rol: Magistrado con voto doble\n• Modo Memoria implementado\n• Sistema INFINITUM mejorado\n• Corrección de bugs en Renuncia',
      },
      {
        title: 'v9.0 - Refactorización Core',
        content: 'Enero 2026\n\n• Modularización del código (vault, lexicon, protocols)\n• Protocolo Renuncia estabilizado\n• Mejoras de rendimiento en móvil',
      },
      {
        title: 'v8.5 - Party Mode 2.0',
        content: 'Diciembre 2025\n\n• Intensidad variable en Modo Fiesta\n• Bartender y roles sociales\n• Sistema de hidratación forzada',
      }
    ]
  },

  {
    id: 'dev-docs',
    title: 'Documentación para Desarrolladores',
    content: 'Guía técnica para contribuidores o curiosos del código.',
    subsections: [
      {
        title: 'Arquitectura del Sistema',
        content: 'Impostor 9.0 está construido con React + TypeScript. La lógica está separada en módulos core.',
        codeBlocks: [
          {
            title: 'Estructura de Carpetas',
            content: `/hooks → Estado global (useGameState)
/utils/core → Módulos principales
  /vault → Historial de jugadores
  /infinitum → Motor de selección
  /paranoia → Detección de patrones
  /lexicon → Gestión de palabras
  /protocols → Renuncia, Magistrado, etc.
/components → UI Components
/types → TypeScript Interfaces`
          }
        ]
      },
      {
        title: 'Contribuir al Proyecto',
        content: 'El proyecto es open-source. Acepta pull requests con:',
        cards: [
          {
            type: 'info',
            title: 'Requisitos',
            content: [
              '✓ Fork del repo: github.com/javirerffggg/Impostor-9.0',
              '✓ Tests pasando (npm test)',
              '✓ Documentación actualizada',
              '✓ Commits con formato: feat/fix/docs(scope): message'
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'secretos',
    title: 'Secretos y Easter Eggs',
    content: 'Cosas ocultas que descubrir por tu cuenta... o leer aquí si no tienes paciencia.',
    subsections: [
      {
        title: 'Debug Mode',
        content: 'Toca el logo "IMPOSTOR" en la pantalla principal 5 veces rápido. Verás las entrañas del sistema.',
      },
      {
        title: 'Tema Secreto "Void"',
        content: 'Cambia tu dispositivo a modo oscuro + activa modo avión + reinicia la app. Aparecerá un tema completamente negro con acentos morados.',
      },
      {
        title: 'Palabra Imposible',
        content: 'Si la palabra secreta es "IMPOSTOR", el sistema activa automáticamente Modo Troll. Probabilidad: 0.01%.',
      },
      {
        title: 'Protocolo Ciego',
        content: 'Si INFINITUM detecta paranoia extrema (>95%), puede activar "Protocolo Ciego" donde la selección es totalmente aleatoria por una ronda.',
      }
    ]
  },

  {
    id: 'glosario',
    title: 'Glosario Técnico',
    content: 'Definiciones de los términos del sistema.',
    subsections: [
        {
            title: 'Términos de INFINITUM',
            content: 'ARE Score: Peso en la lotería. Bóveda: Historial del jugador. Karma: Racha de civil. Ratio: % de veces impostor.',
        },
        {
            title: 'Términos de Protocolos',
            content: 'Leteo: Borrado de memoria. Pandora: Eventos troll. Vocalis: Selección de iniciador. Nexus: Alianza de impostores.',
        },
        {
            title: 'Términos de Eventos',
            content: 'Espejo Total: Todos impostores. Falsa Alarma: Todos civiles.',
        }
    ]
  }
];
