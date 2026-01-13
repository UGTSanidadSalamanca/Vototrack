
export interface Voter {
  id: number;
  nombre: string;
  apellido: string;
  apellido2: string;
  telefono: string;
  email: string;
  afiliadoUGT: boolean;
  haVotado: boolean;
  horaVoto: string | null;
  centroVotacion: string;
  mesaVotacion: string;
}

export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'mesa';
  center: string;
}

export interface UnionVotes {
  union: string;
  votes: number;
}

export interface ElectionData {
  blankVotes: number;
  nullVotes: number;
  unionVotes: UnionVotes[];
}

export interface ElectionCalculation {
  union: string;
  votes: number;
  percentage: number;
  excluded: boolean;
  initialSeats: number;
  remainder: number;
  finalSeats: number;
}
