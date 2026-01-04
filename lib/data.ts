
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

export const voterService = {
  getVoters: async (): Promise<Voter[]> => {
    // Simulamos una pequeña carga local
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockVoters), 300);
    });
  },

  getUsers: async (): Promise<User[]> => {
    return mockUsers;
  },

  updateVoterStatus: async (voterId: number, hasVoted: boolean): Promise<{ success: boolean; horaVoto: string | null }> => {
    const hora = hasVoted ? new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null;
    return { success: true, horaVoto: hora };
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
