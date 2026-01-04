
import React, { useState, useMemo, useContext, useCallback, useEffect } from 'react';
import { voterService, VOTING_CENTERS } from '../lib/data';
import { Voter, User } from '../types';
import Header from './Header';
import SummaryCard from './SummaryCard';
import StatisticsCard from './StatisticsCard';
import FilterControls from './FilterControls';
import VoterList from './VoterList';
import UserManagement from './UserManagement';
import { AuthContext } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Users, UserCog, Loader2 } from 'lucide-react';

const normalizeText = (text: string) => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const AuthenticatedApp: React.FC = () => {
  const auth = useContext(AuthContext);
  const currentUser = auth?.user as User;

  const [activeTab, setActiveTab] = useState<'voters' | 'users'>('voters');
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [affiliationFilter, setAffiliationFilter] = useState('todos');
  const [voteStatusFilter, setVoteStatusFilter] = useState('todos');
  const [centerFilter, setCenterFilter] = useState(currentUser.role === 'mesa' ? currentUser.center : 'todos');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await voterService.getVoters();
      setAllVoters(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleVoterStatusChange = useCallback(async (voterId: number, hasVoted: boolean) => {
    const result = await voterService.updateVoterStatus(voterId, hasVoted);
    if(result.success) {
        setAllVoters(prevVoters => 
            prevVoters.map(v => 
                v.id === voterId ? { ...v, haVotado: hasVoted, horaVoto: result.horaVoto } : v
            )
        );
    }
  }, []);

  const votersForUser = useMemo(() => {
    if (currentUser.role === 'mesa') {
        return allVoters.filter(v => v.centroVotacion === currentUser.center);
    }
    return allVoters;
  }, [allVoters, currentUser]);

  const filteredVoters = useMemo(() => {
    return votersForUser
      .filter(voter => {
        const normalizedSearch = normalizeText(searchTerm);
        return (
          normalizeText(voter.nombre).includes(normalizedSearch) ||
          normalizeText(voter.apellido).includes(normalizedSearch) ||
          normalizeText(voter.apellido2).includes(normalizedSearch) ||
          normalizeText(voter.email).includes(normalizedSearch) ||
          voter.telefono.includes(normalizedSearch)
        );
      })
      .filter(voter => {
        if (affiliationFilter === 'afiliados') return voter.afiliadoUGT;
        if (affiliationFilter === 'no_afiliados') return !voter.afiliadoUGT;
        return true;
      })
      .filter(voter => {
        if (voteStatusFilter === 'votado') return voter.haVotado;
        if (voteStatusFilter === 'no_votado') return !voter.haVotado;
        return true;
      })
      .filter(voter => {
        if (currentUser.role === 'admin' && centerFilter !== 'todos') {
            return voter.centroVotacion === centerFilter;
        }
        return true; 
      });
  }, [votersForUser, searchTerm, affiliationFilter, voteStatusFilter, centerFilter, currentUser.role]);
  
  const votingCenters = useMemo(() => ['todos', ...VOTING_CENTERS], []);

  const totalVoters = votersForUser.length;
  const votersWhoVoted = votersForUser.filter(v => v.haVotado).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Header />

      {currentUser.role === 'admin' && (
        <div className="flex gap-2 bg-card p-1 border border-white/10 rounded-lg w-fit">
          <Button 
            variant={activeTab === 'voters' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('voters')}
          >
            <Users className="w-4 h-4 mr-2" />
            Votantes
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('users')}
          >
            <UserCog className="w-4 h-4 mr-2" />
            Usuarios
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-400">Cargando datos locales...</p>
        </div>
      ) : activeTab === 'voters' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1 flex flex-col gap-6">
            <SummaryCard 
              totalVoters={totalVoters}
              votersWhoVoted={votersWhoVoted}
            />
            <StatisticsCard voters={votersForUser} />
          </aside>

          <main className="lg:col-span-2 flex flex-col gap-6">
            <FilterControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                affiliationFilter={affiliationFilter}
                setAffiliationFilter={setAffiliationFilter}
                voteStatusFilter={voteStatusFilter}
                setVoteStatusFilter={setVoteStatusFilter}
                centerFilter={centerFilter}
                setCenterFilter={setCenterFilter}
                votingCenters={votingCenters}
                user={currentUser}
                filteredVoters={filteredVoters}
            />
            <VoterList 
                voters={filteredVoters} 
                onStatusChange={handleVoterStatusChange} 
            />
          </main>
        </div>
      ) : (
        <UserManagement />
      )}
    </div>
  );
};

export default AuthenticatedApp;
