const EN_WEB = /\/web\/src\/.+\.(ts|tsx|js|jsx|mjs)$/;
const CAPA_HTTP = /\/web\/src\/shared\/api\//;
const ES_PRUEBA = /\.(test|spec)\.[a-z]+$/;
const FETCH_GLOBAL = /(?<![.\w$])fetch\s*\(|\b(window|globalThis|self)\.fetch\s*\(/;
const AXIOS = /\bfrom\s*['"]axios['"]|\b(require|import)\(\s*['"]axios['"]\s*\)/;

export default {
  nombre: 'sin-fetch-directo',
  accion: 'bloquear',
  porQue: 'Solo apiClient renueva el token cuando la API responde 401. Una llamada directa falla en silencio a mitad de sesión.',
  comoHacerlo: "Llama a la API desde el api.ts de la feature con import { apiClient } from '@/shared/api/apiClient'.",
  detectar(evento) {
    if (evento.tipo !== 'archivo') return null;
    const { ruta, contenido } = evento;
    if (!EN_WEB.test(ruta) || CAPA_HTTP.test(ruta) || ES_PRUEBA.test(ruta)) return null;
    if (FETCH_GLOBAL.test(contenido)) return `${ruta} llama a fetch() directamente.`;
    if (AXIOS.test(contenido)) return `${ruta} usa axios.`;
    return null;
  },
};
