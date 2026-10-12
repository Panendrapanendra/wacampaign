export const API_BASE_URL = 'http://127.0.0.1:3000/api';

export const endpoints = {
  // Auth & Users
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  users: `${API_BASE_URL}/users`,
  
  // WhatsApp Engine
  waStatus: `${API_BASE_URL}/whatsapp/status`,
  waGenerateQr: `${API_BASE_URL}/whatsapp/generate-qr`,
  waLogout: `${API_BASE_URL}/whatsapp/logout`,
  waSendMessage: `${API_BASE_URL}/whatsapp/send-message`,
};