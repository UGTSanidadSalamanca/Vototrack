
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
      const response = await fetch(`${API_URL}?op=voters`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching voters:", error);
      return [];
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}?op=users`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  updateVoterStatus: async (voterId: number, hasVoted: boolean): Promise<{ success: boolean; horaVoto: string | null }> => {
    const hora = hasVoted ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null;

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateVote',
          id: voterId,
          haVotado: hasVoted,
          horaVoto: hora
        })
      });

      return { success: true, horaVoto: hora };
    } catch (error) {
      console.error("Error updating voter status:", error);
      return { success: false, horaVoto: null };
    }
  },

  addUser: async (user: User): Promise<{ success: boolean; message?: string }> => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createUser',
          username: user.username,
          password: user.password,
          role: user.role,
          center: user.center
        })
      });
      return { success: true };
    } catch (error) {
      console.error("Error adding user:", error);
      return { success: false };
    }
  },

  deleteUser: async (username: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteUser',
          username: username
        })
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false };
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
