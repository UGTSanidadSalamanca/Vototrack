
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
  }
];

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
        // Saneamiento profundo para evitar errores de búsqueda
        return data
          .filter(v => v && typeof v === 'object')
          .map((v: any) => ({
            id: Number(v.id || 0),
            nombre: String(v.nombre || ""),
            apellido: String(v.apellido || ""),
            apellido2: String(v.apellido2 || ""),
            telefono: String(v.telefono || ""),
            email: String(v.email || ""),
            afiliadoUGT: v.afiliadoUGT === true || String(v.afiliadoUGT).toLowerCase() === "true",
            haVotado: v.haVotado === true || String(v.haVotado).toLowerCase() === "true",
            horaVoto: v.horaVoto ? String(v.horaVoto) : null,
            centroVotacion: String(v.centroVotacion || "No asignado"),
            mesaVotacion: String(v.mesaVotacion || "Sin mesa")
          }));
      }
      return mockVoters;
    } catch (error) {
      console.error("Error fetching voters:", error);
      return mockVoters;
    }
  },

  getUsers: async (): Promise<User[]> => {
    const userMap = new Map<string, User>();
    mockUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));

    try {
      const savedUsers = window.localStorage.getItem('voto-track-managed-users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers)) {
          parsedUsers.forEach(u => {
            if (u && typeof u.username === 'string') userMap.set(u.username.toLowerCase(), u);
          });
        }
      }
    } catch (e) { console.error(e); }

    try {
      const response = await fetch(`${API_URL}?action=getUsers&t=${Date.now()}`, { method: 'GET', redirect: 'follow' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          data.forEach(u => {
            if (u && typeof u.username === 'string') userMap.set(u.username.toLowerCase(), u);
          });
        }
      }
    } catch (error) { console.warn(error); }

    return Array.from(userMap.values());
  },

  updateVoterStatus: async (voterId: number, hasVoted: boolean): Promise<{ success: boolean; horaVoto: string | null }> => {
    const hora = hasVoted ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null;
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateVote', id: voterId, haVotado: hasVoted, horaVoto: hora }),
        redirect: 'follow'
      });
      return { success: true, horaVoto: hora };
    } catch (error) {
      console.error(error);
      return { success: false, horaVoto: null };
    }
  },

  sendReminder: async (voterId: number) => {
    alert(`Recordatorio enviado al votante ID: ${voterId}`);
    return { success: true };
  },

  sendMassReminder: async (voterIds: number[]) => {
    alert(`Recordatorio masivo enviado a ${voterIds.length} afiliados.`);
    return { success: true };
  }
};
