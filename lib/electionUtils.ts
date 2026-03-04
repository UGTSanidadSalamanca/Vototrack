
import { ElectionData, ElectionCalculation } from '../types';

export const UNIONS = [
  'UGT', 'CCOO', 'CGT', 'CSIF', 'SATSE', 'TYSCYL', 'USO', 'SINGEFE'
];

export const calculateElectionResults = (data: ElectionData, totalSeats: number = 35): ElectionCalculation[] => {
  const votesToUnions = data.unionVotes.reduce((acc, curr) => acc + curr.votes, 0);
  const validVotes = votesToUnions + data.blankVotes;
  const threshold = validVotes * 0.05;

  // 1. Filtrar por barrera del 5%
  let results: ElectionCalculation[] = data.unionVotes.map(uv => {
    const percentage = validVotes > 0 ? (uv.votes / validVotes) * 100 : 0;
    return {
      union: uv.union,
      votes: uv.votes,
      percentage,
      excluded: uv.votes < threshold,
      initialSeats: 0,
      remainder: 0,
      finalSeats: 0
    };
  });

  const admittedUnions = results.filter(r => !r.excluded && r.votes > 0);
  
  if (admittedUnions.length === 0 || totalSeats <= 0) return results;

  // 2. Sistema D'Hondt
  // Creamos una lista de todos los posibles cocientes
  interface Quotient {
    union: string;
    value: number;
  }

  const allQuotients: Quotient[] = [];
  
  admittedUnions.forEach(union => {
    for (let i = 1; i <= totalSeats; i++) {
      allQuotients.push({
        union: union.union,
        value: union.votes / i
      });
    }
  });

  // Ordenamos los cocientes de mayor a menor
  allQuotients.sort((a, b) => b.value - a.value);

  // Tomamos los primeros 'totalSeats' cocientes
  const winningQuotients = allQuotients.slice(0, totalSeats);

  // Contamos cuántos delegados le corresponden a cada sindicato
  results = results.map(r => {
    if (r.excluded) return r;
    const seats = winningQuotients.filter(q => q.union === r.union).length;
    return { ...r, finalSeats: seats, initialSeats: seats };
  });

  return results;
};
