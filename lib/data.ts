
import { User, Voter } from '../types';

export const VOTING_CENTERS = ['Hospital Clínico', 'Montalvos', 'Hospital Béjar', 'Primaria', 'Emergencias', 'Fibsal'];

export const mockUsers: User[] = [
  { username: 'admin', password: 'password', role: 'admin', center: 'Todos' },
  { username: 'mesa1', password: 'password', role: 'mesa', center: 'Hospital Clínico' }
];

export const mockVoters: Voter[] = [
  {
    id: 1,
    nombre: 'JUAN',
    apellido: 'GARCIA',
    apellido2: 'LOPEZ',
    telefono: '600111222',
    email: 'juan.garcia@saludcastillayleon.es',
    afiliadoUGT: true,
    haVotado: false,
    horaVoto: null,
    centroVotacion: 'Hospital Clínico',
    mesaVotacion: 'Mesa A'
  },
  {
    id: 2,
    nombre: 'MARIA',
    apellido: 'RODRIGUEZ',
    apellido2: 'PÉREZ',
    telefono: '611222333',
    email: 'm.rodriguez@saludcastillayleon.es',
    afiliadoUGT: false,
    haVotado: true,
    horaVoto: '10:15',
    centroVotacion: 'Montalvos',
    mesaVotacion: 'Mesa B'
  },
  {
    id: 3,
    nombre: 'CARLOS',
    apellido: 'SÁNCHEZ',
    apellido2: 'MARTÍN',
    telefono: '622333444',
    email: 'c.sanchez@saludcastillayleon.es',
    afiliadoUGT: true,
    haVotado: false,
    horaVoto: null,
    centroVotacion: 'Hospital Béjar',
    mesaVotacion: 'Mesa Única'
  }
];

const API_URL = "https://script.google.com/macros/s/AKfycbz0i7LAhiMDU3FZEahkU9wt_SjcYPQVeJvTQ356R00BQdEz2PzpdNfnAYbA_t4ZUeBZ/exec";

export const voterService = {
  getVoters: async (): Promise<Voter[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Ensure specific fields are correctly typed if necessary, though the script helps.
      return data;
    } catch (error) {
      console.error("Error fetching voters:", error);
      return [];
    }
  },

  getUsers: async (): Promise<User[]> => {
    return mockUsers;
  },

  updateVoterStatus: async (voterId: number, hasVoted: boolean): Promise<{ success: boolean; horaVoto: string | null }> => {
    const hora = hasVoted ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null;

    try {
      // We use 'no-cors' mode if needed, but for POST with JSON body to Apps Script, 
      // standard fetch often works if the script handles the response correctly with JSONP or CORS headers.
      // However, Apps Script usually requires 'application/x-www-form-urlencoded' or specific handling for CORS.
      // The provided script uses `JSON.parse(e.postData.contents)`, so we must send raw stringified JSON.
      // Standard fetch to Apps Script often follows redirects.

      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script POSTs often require no-cors or redirect handling
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: voterId,
          haVotado: hasVoted,
          horaVoto: hora
        })
      });

      // With 'no-cors', we can't read the response, but we assume success if no network error.
      // If we need the response, we have to deal with CORS properly or use a proxy.
      // For now, let's assume optimistic UI update.

      return { success: true, horaVoto: hora };
    } catch (error) {
      console.error("Error updating voter status:", error);
      return { success: false, horaVoto: null };
    }
  },

  sendReminder: async (voterId: number): Promise<{ success: boolean }> => {
    alert(`Recordatorio enviado al votante ID: ${voterId}`);
    return { success: true };
  },

  sendMassReminder: async (voterIds: number[]): Promise<{ success: boolean }> => {
    alert(`Recordatorio masivo enviado a ${voterIds.length} afiliados.`);
    return { success: true };
  }
};
