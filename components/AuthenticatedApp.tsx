
import React, { useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { voterService, VOTING_CENTERS, VOTING_TABLES } from '../lib/data';
import { Voter, User } from '../types';
import Header from './Header';
import SummaryCard from './SummaryCard';
import StatisticsCard from './StatisticsCard';
import FilterControls from './FilterControls';
import VoterList from './VoterList';
import UserManagement from './UserManagement';
import ElectionResults from './ElectionResults';
import { AuthContext } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Users, UserCog, Loader2, BarChart4 } from 'lucide-react';

const normalizeText = (text: any): string => {
  if (!text) return "";
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const AuthenticatedApp: React.FC = () => {
  const auth = useContext(AuthContext);
  const currentUser = auth?.user as User;

  const [activeTab, setActiveTab] = useState<'voters' | 'users' | 'results'>('voters');
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [affiliationFilter, setAffiliationFilter] = useState('todos');
  const [voteStatusFilter, setVoteStatusFilter] = useState('todos');
  
  // Si el usuario es de mesa, su filtro inicial es su mesa asignada. Si es admin, es 'todos'.
  const [centerFilter, setCenterFilter] = useState(currentUser?.role === 'mesa' ? currentUser.center : 'todos');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const data = await voterService.getVoters();
    setAllVoters(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusChange = async (voterId: number, hasVoted: boolean) => {
    setAllVoters(prev => prev.map(v => v.id === voterId ? { ...v, haVotado: hasVoted, horaVoto: hasVoted ? '...' : null } : v));
    const { success, horaVoto } = await voterService.updateVoterStatus(voterId, hasVoted);
    if (success) {
      setAllVoters(prev => prev.map(v => v.id === voterId ? { ...v, haVotado: hasVoted, horaVoto } : v));
    } else {
      fetchData(); 
    }
  };

  const filteredVoters = useMemo(() => {
    return allVoters.filter(voter => {
      // 1. Busqueda por texto (Nombre, Apellido o DNI)
      const matchesSearch = !searchTerm || 
        normalizeText(voter.nombre).includes(normalizeText(searchTerm)) ||
        normalizeText(voter.apellido).includes(normalizeText(searchTerm)) ||
        normalizeText(voter.apellido2).includes(normalizeText(searchTerm)) ||
        normalizeText(voter.dni).includes(normalizeText(searchTerm));

      // 2. Filtro de afiliación
      const matchesAffiliation = affiliationFilter === 'todos' || 
        (affiliationFilter === 'afiliados' && voter.afiliadoUGT) ||
        (affiliationFilter === 'no_afiliados' && !voter.afiliadoUGT);

      // 3. Filtro de estado de voto
      const matchesVoteStatus = voteStatusFilter === 'todos' || 
        (voteStatusFilter === 'votado' && voter.haVotado) ||
        (voteStatusFilter === 'no_votado' && !voter.haVotado);

      // 4. Lógica de Centro/Mesa combinada
      const matchesCenter = centerFilter === 'todos' || 
        voter.centroVotacion === centerFilter || 
        voter.mesaVotacion === centerFilter;

      return matchesSearch && matchesAffiliation && matchesVoteStatus && matchesCenter;
    });
  }, [allVoters, searchTerm, affiliationFilter, voteStatusFilter, centerFilter]);

  const stats = useMemo(() => {
    const total = filteredVoters.length;
    const voted = filteredVoters.filter(v => v.haVotado).length;
    return { total, voted };
  }, [filteredVoters]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Header />

      <div className="flex flex-wrap gap-2 no-print">
        <Button 
          variant={activeTab === 'voters' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('voters')} 
          className="gap-2"
        >
          <Users className="w-4 h-4" /> Seguimiento
        </Button>
        {currentUser.role === 'admin' && (
          <>
            <Button 
              variant={activeTab === 'users' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('users')} 
              className="gap-2"
            >
              <UserCog className="w-4 h-4" /> Accesos
            </Button>
            <Button 
              variant={activeTab === 'results' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('results')} 
              className="gap-2"
            >
              <BarChart4 className="w-4 h-4" /> Escrutinio
            </Button>
          </>
        )}
      </div>

      {isLoading && allVoters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-400">Accediendo a Hoja 1 y Usuarios...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'voters' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <SummaryCard totalVoters={stats.total} votersWhoVoted={stats.voted} />
                <StatisticsCard voters={filteredVoters} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <FilterControls 
                  searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                  affiliationFilter={affiliationFilter} setAffiliationFilter={setAffiliationFilter}
                  voteStatusFilter={voteStatusFilter} setVoteStatusFilter={setVoteStatusFilter}
                  centerFilter={centerFilter} setCenterFilter={setCenterFilter}
                  votingCenters={['todos', ...VOTING_CENTERS, ...VOTING_TABLES]}
                  user={currentUser} filteredVoters={filteredVoters}
                />
                <VoterList voters={filteredVoters} onStatusChange={handleStatusChange} />
              </div>
            </div>
          )}
          {activeTab === 'users' && currentUser.role === 'admin' && <UserManagement />}
          {activeTab === 'results' && currentUser.role === 'admin' && <ElectionResults voters={allVoters} />}
        </div>
      )}
    </div>
  );
};

export default AuthenticatedApp;
