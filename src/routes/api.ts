import axios from 'axios';

// La app se sirve como archivos estáticos, por eso la URL del backend se fija al buildear
export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});
