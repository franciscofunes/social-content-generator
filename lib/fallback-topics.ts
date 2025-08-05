import { Topic } from '@/lib/types/topic';

// Fallback topics in case Gemini API fails
export const FALLBACK_TOPICS: Omit<Topic, 'id' | 'createdDate' | 'lastUsedDate'>[] = [
  {
    title: "Uso correcto del casco de seguridad en obras de construcción",
    category: "epp",
    description: "Importancia y normas para el uso adecuado del casco de protección en sitios de construcción según regulaciones argentinas",
    usageCount: 0,
    priorityScore: 9,
    seasonalRelevance: "all",
    regulatoryReference: "Ley 19587 - Decreto 351/79",
    keywords: ["casco", "seguridad", "construcción", "EPP", "obra"],
    isArchived: false
  },
  {
    title: "Prevención de accidentes con herramientas eléctricas",
    category: "electrica",
    description: "Medidas de seguridad esenciales para el manejo seguro de herramientas eléctricas en el ámbito laboral",
    usageCount: 0,
    priorityScore: 10,
    seasonalRelevance: "all",
    regulatoryReference: "Reglamento de Instalaciones Eléctricas AEA 90364",
    keywords: ["electricidad", "herramientas", "prevención", "seguridad"],
    isArchived: false
  },
  {
    title: "Ergonomía en el trabajo de oficina: postura correcta",
    category: "ergonomia",
    description: "Guía para mantener una postura adecuada y prevenir lesiones musculoesqueléticas en trabajos de oficina",
    usageCount: 0,
    priorityScore: 8,
    seasonalRelevance: "all",
    keywords: ["ergonomía", "oficina", "postura", "espalda", "salud"],
    isArchived: false
  },
  {
    title: "Primeros auxilios: qué hacer ante una quemadura",
    category: "primeros-auxilios",
    description: "Procedimientos básicos de primeros auxilios para tratar quemaduras en el lugar de trabajo",
    usageCount: 0,
    priorityScore: 9,
    seasonalRelevance: "all",
    keywords: ["primeros auxilios", "quemaduras", "emergencia", "tratamiento"],
    isArchived: false
  },
  {
    title: "Señalización de seguridad en espacios de trabajo",
    category: "prevencion",
    description: "Importancia y tipos de señalización de seguridad requerida en diferentes espacios laborales",
    usageCount: 0,
    priorityScore: 7,
    seasonalRelevance: "all",
    regulatoryReference: "IRAM 10005",
    keywords: ["señalización", "seguridad", "prevención", "normas"],
    isArchived: false
  },
  {
    title: "Manejo seguro de sustancias químicas peligrosas",
    category: "quimicos",
    description: "Protocolos de seguridad para el almacenamiento y manipulación de productos químicos en el trabajo",
    usageCount: 0,
    priorityScore: 10,
    seasonalRelevance: "all",
    regulatoryReference: "Decreto 351/79 - Capítulo 17",
    keywords: ["químicos", "sustancias peligrosas", "manipulación", "almacenamiento"],
    isArchived: false
  },
  {
    title: "Capacitación obligatoria en seguridad e higiene laboral",
    category: "capacitacion",
    description: "Requisitos legales de capacitación en seguridad para trabajadores según la normativa argentina",
    usageCount: 0,
    priorityScore: 8,
    seasonalRelevance: "all",
    regulatoryReference: "Ley 19587 - Res. SRT 299/11",
    keywords: ["capacitación", "entrenamiento", "obligatorio", "normativa"],
    isArchived: false
  },
  {
    title: "Seguridad en trabajos en altura",
    category: "construccion",
    description: "Medidas de protección y equipos necesarios para trabajos seguros en altura",
    usageCount: 0,
    priorityScore: 10,
    seasonalRelevance: "all",
    regulatoryReference: "Decreto 351/79 - Anexo VII",
    keywords: ["altura", "arnés", "andamios", "construcción", "caídas"],
    isArchived: false
  },
  {
    title: "Normativas de seguridad para espacios confinados",
    category: "normativas",
    description: "Regulaciones específicas para el trabajo seguro en espacios confinados según la legislación argentina",
    usageCount: 0,
    priorityScore: 9,
    seasonalRelevance: "all",
    regulatoryReference: "Res. SRT 953/10",
    keywords: ["espacios confinados", "normativas", "regulaciones", "permisos"],
    isArchived: false
  },
  {
    title: "Mantenimiento preventivo de maquinaria industrial",
    category: "maquinaria",
    description: "Importancia del mantenimiento preventivo para la seguridad en el uso de maquinaria industrial",
    usageCount: 0,
    priorityScore: 8,
    seasonalRelevance: "all",
    keywords: ["mantenimiento", "maquinaria", "preventivo", "industrial", "seguridad"],
    isArchived: false
  },
  {
    title: "Protección respiratoria en ambientes laborales",
    category: "epp",
    description: "Selección y uso correcto de equipos de protección respiratoria según el tipo de contaminante",
    usageCount: 0,
    priorityScore: 9,
    seasonalRelevance: "all",
    keywords: ["respiratoria", "mascarillas", "filtros", "contaminantes", "EPP"],
    isArchived: false
  },
  {
    title: "Plan de evacuación y salidas de emergencia",
    category: "prevencion",
    description: "Diseño e implementación de planes de evacuación efectivos en el lugar de trabajo",
    usageCount: 0,
    priorityScore: 9,
    seasonalRelevance: "all",
    regulatoryReference: "Decreto 351/79 - Capítulo 12",
    keywords: ["evacuación", "emergencia", "salidas", "plan", "seguridad"],
    isArchived: false
  },
  {
    title: "Prevención de golpes de calor en verano",
    category: "prevencion",
    description: "Medidas preventivas para evitar golpes de calor durante trabajos en exteriores en época estival",
    usageCount: 0,
    priorityScore: 10,
    seasonalRelevance: "verano",
    keywords: ["golpe de calor", "verano", "hidratación", "temperatura", "prevención"],
    isArchived: false
  },
  {
    title: "Seguridad eléctrica en temporada de lluvias",
    category: "electrica",
    description: "Precauciones especiales para trabajos con electricidad durante la temporada de lluvias",
    usageCount: 0,
    priorityScore: 9,
    seasonalRelevance: "invierno",
    keywords: ["electricidad", "lluvia", "humedad", "precauciones", "invierno"],
    isArchived: false
  },
  {
    title: "Uso de guantes de protección según el riesgo",
    category: "epp",
    description: "Selección apropiada de guantes de protección según el tipo de riesgo laboral",
    usageCount: 0,
    priorityScore: 8,
    seasonalRelevance: "all",
    keywords: ["guantes", "protección", "manos", "EPP", "riesgos"],
    isArchived: false
  }
];

export function generateFallbackTopics(): Topic[] {
  return FALLBACK_TOPICS.map((topic, index) => ({
    ...topic,
    id: `fallback_topic_${Date.now()}_${index}`,
    createdDate: new Date()
  }));
}