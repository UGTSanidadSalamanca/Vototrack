
import { User, Voter } from '../types';

export const VOTING_CENTERS = [
  'Hospital Clínico', 
  'Primaria', 
  'Montalvos', 
  'Hospital Béjar'
];

export const VOTING_TABLES = [
  'MESA 1', 'MESA 2', 'MESA 3', 'MESA 4', 'MESA 5', 'MESA 6', 
  'MESA 7', 'MESA 8', 'MESA 9'
];

// Función auxiliar para determinar el centro basado en la mesa
const getCenterFromMesa = (mesa: string): string => {
  const m = mesa.toUpperCase().trim();
  if (['MESA 1', 'MESA 2', 'MESA 3', 'MESA 4', 'MESA 5', 'MESA 6'].includes(m)) return 'Hospital Clínico';
  if (m === 'MESA 7') return 'Primaria';
  if (m === 'MESA 8') return 'Montalvos';
  if (m === 'MESA 9') return 'Hospital Béjar';
  return 'No asignado';
};

export const mockUsers: User[] = [
  { username: 'admin', password: 'password', role: 'admin', center: 'Todos' }
];

export const mockVoters: Voter[] = [
  {
    id: 1,
    dni: '***2754**',
    nombre: 'ELVIRA',
    apellido: 'ABAD',
    apellido2: 'CAÑIBANO',
    telefono: '',
    email: '',
    afiliadoUGT: false,
    haVotado: false,
    horaVoto: null,
    centroVotacion: 'Hospital Clínico',
    mesaVotacion: 'MESA 1'
  }
];

const API_URL = "https://script.google.com/macros/s/AKfycbzePI4kH7k3uaMeq-dyi8g4rVgqGp7E26phVtSt8qyMWJf7_o3x4JDFkMUHEk7Am00h/exec";

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
        // FILTRO CRÍTICO: Eliminamos filas donde el ID no sea un número o el nombre esté vacío
        return data
          .filter((v: any) => v.id && !isNaN(Number(v.id)) && String(v.nombre || "").trim() !== "")
          .map((v: any) => {
            const mesa = String(v.mesaVotacion || "").trim();
            const centro = v.centroVotacion && String(v.centroVotacion).trim() !== "" 
              ? String(v.centroVotacion).trim() 
              : getCenterFromMesa(mesa);

            return {
              id: Number(v.id),
              dni: String(v.dni || ""),
              nombre: String(v.nombre || "").toUpperCase(),
              apellido: String(v.apellido || "").toUpperCase(),
              apellido2: String(v.apellido2 || "").toUpperCase(),
              telefono: String(v.telefono || ""),
              email: String(v.email || ""),
              afiliadoUGT: String(v.afiliadoUGT).toLowerCase().includes("afiliado") || String(v.afiliadoUGT).toLowerCase() === "true",
              haVotado: String(v.haVotado).toUpperCase() === "TRUE",
              horaVoto: v.horaVoto ? String(v.horaVoto) : null,
              centroVotacion: centro,
              mesaVotacion: mesa
            };
          });
      }
      return mockVoters;
    } catch (error) {
      console.error("Error fetching voters:", error);
      return mockVoters;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}?action=getUsers&t=${Date.now()}`, { 
        method: 'GET', 
        redirect: 'follow' 
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data
            .filter((u: any) => u.username && String(u.username).trim() !== "")
            .map(u => ({
              username: String(u.username || ""),
              password: String(u.password || ""),
              role: String(u.role).toLowerCase() === 'admin' ? 'admin' : 'mesa',
              center: String(u.center || "Todos")
            }));
        }
      }
    } catch (error) { console.warn(error); }
    return mockUsers;
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
      return { success: false, horaVoto: null };
    }
  },

  sendReminder: async (voterId: number) => { return { success: true }; },
  sendMassReminder: async (voterIds: number[]) => { return { success: true }; }
};
