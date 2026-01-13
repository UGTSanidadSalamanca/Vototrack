
import { ElectionData, ElectionCalculation } from '../types';

export const UNIONS = [
  'SATSE', 'CSIF', 'CESM-TISCYL', 'USAIE-SAE', 'UGT', 
  'CCOO', 'TCAE-CAUSA', 'CGT', 'USCAL', 'ASPES'
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

  const admittedUnions = results.filter(r => !r.excluded);
  const admittedVotesTotal = admittedUnions.reduce((acc, curr) => acc + curr.votes, 0);

  if (admittedVotesTotal === 0) return results;

  // 2. Reparto por Cociente
  const quotient = admittedVotesTotal / totalSeats;
  let allocatedSeats = 0;

  results = results.map(r => {
    if (r.excluded) return r;
    const seats = Math.floor(r.votes / quotient);
    const remainder = r.votes % quotient;
    allocatedSeats += seats;
    return { ...r, initialSeats: seats, finalSeats: seats, remainder };
  });

  // 3. Reparto por Restos Mayores
  let remainingSeats = totalSeats - allocatedSeats;
  
  while (remainingSeats > 0) {
    const winner = results
      .filter(r => !r.excluded)
      .sort((a, b) => b.remainder - a.remainder)
      .find(r => {
          // Buscamos al primero que no haya recibido un asiento extra en esta fase de restos
          // En una vuelta simple de restos mayores cada uno solo puede recibir 1 max
          return true; 
      });

    // Nota: El algoritmo estándar de restos mayores ordena por el resto de la división
    // y reparte 1 a cada uno hasta agotar los asientos sobrantes.
    const sortedByRemainder = [...results]
        .filter(r => !r.excluded)
        .sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < remainingSeats && i < sortedByRemainder.length; i++) {
        const unionToUpdate = sortedByRemainder[i].union;
        results = results.map(r => 
            r.union === unionToUpdate ? { ...r, finalSeats: r.finalSeats + 1 } : r
        );
    }
    remainingSeats = 0;
  }

  return results;
};
