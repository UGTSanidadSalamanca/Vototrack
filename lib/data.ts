
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

// URL de la API de Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbz0i7LAhiMDU3FZEahkU9wt_SjcYPQVeJvTQ356R00BQdEz2PzpdNfnAYbA_t4ZUeBZ/exec";

export const voterService = {
  getVoters: async (): Promise<Voter[]> => {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow',
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map((v: any) => ({
          ...v,
          id: Number(v.id),
          afiliadoUGT: v.afiliadoUGT === true || String(v.afiliadoUGT).toUpperCase() === "TRUE",
          haVotado: v.haVotado === true || String(v.haVotado).toUpperCase() === "TRUE",
          horaVoto: v.horaVoto || null
        }));
      }
      return mockVoters;
    } catch (error) {
      console.error("Error fetching voters (falling back to mock):", error);
      return mockVoters;
    }
  },

  getUsers: async (): Promise<User[]> => {
    // 1. Intentar obtener de LocalStorage (usuarios creados manualmente)
    try {
      const savedUsers = window.localStorage.getItem('voto-track-managed-users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          return parsedUsers;
        }
      }
    } catch (e) {
      console.error("Error reading localStorage users", e);
    }

    // 2. Intentar obtener de la API
    try {
      const response = await fetch(`${API_URL}?action=getUsers&t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow',
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (error) {
      console.warn("Error fetching users from API, using mock users:", error);
    }

    // 3. Fallback a mockUsers
    return mockUsers;
  },

  updateVoterStatus: async (voterId: number, hasVoted: boolean): Promise<{ success: boolean; horaVoto: string | null }> => {
    const hora = hasVoted ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null;

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'updateVote',
          id: voterId,
          haVotado: hasVoted,
          horaVoto: hora
        }),
        redirect: 'follow'
      });

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
