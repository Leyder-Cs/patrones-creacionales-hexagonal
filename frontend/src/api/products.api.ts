import axios from "axios";

// Instancia base: todas las llamadas al backend pasan por aquí
export const productClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000, // si Flask no responde en 5 s, lanza error
});