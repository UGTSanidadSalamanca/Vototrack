
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Progress } from './ui/Progress';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Users, UserCheck, UserX, Calculator, RefreshCw } from 'lucide-react';

interface SummaryCardProps {
    totalVoters: number;
    votersWhoVoted: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ totalVoters, votersWhoVoted }) => {
    const [isManual, setIsManual] = useState(false);
    const [manualVotes, setManualVotes] = useState<number>(votersWhoVoted);

    // Sincronizar el valor manual cuando cambia el automático, pero solo si no estamos en modo manual
    useEffect(() => {
        if (!isManual) {
            setManualVotes(votersWhoVoted);
        }
    }, [votersWhoVoted, isManual]);

    const displayVotes = isManual ? manualVotes : votersWhoVoted;
    const notVoted = Math.max(0, totalVoters - displayVotes);
    const participationPercentage = totalVoters > 0 ? (displayVotes / totalVoters) * 100 : 0;

    const handleManualChange = (val: string) => {
        const num = parseInt(val) || 0;
        setManualVotes(Math.min(num, totalVoters));
    };

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Participación</CardTitle>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsManual(!isManual)}
                        className={`h-8 px-2 ${isManual ? 'text-primary bg-primary/10' : 'text-gray-400'}`}
                        title={isManual ? "Volver a recuento real" : "Activar modo simulador"}
                    >
                        {isManual ? <RefreshCw className="w-4 h-4 mr-1 animate-spin-slow" /> : <Calculator className="w-4 h-4 mr-1" />}
                        <span className="text-[10px] uppercase font-bold">{isManual ? 'Real' : 'Simular'}</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isManual && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mb-2 text-[10px] text-primary font-bold uppercase text-center">
                        Modo Calculadora Activo
                    </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Censo Total</span>
                    </div>
                    <span className="font-bold">{totalVoters}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <UserCheck className="w-4 h-4" />
                        <span>Votos Emitidos</span>
                    </div>
                    {isManual ? (
                        <Input 
                            type="number" 
                            className="w-20 h-7 text-right font-bold bg-white/5 border-primary/30"
                            value={manualVotes}
                            onChange={(e) => handleManualChange(e.target.value)}
                            max={totalVoters}
                        />
                    ) : (
                        <span className="font-bold text-emerald-400">{votersWhoVoted}</span>
                    )}
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-red-400">
                        <UserX className="w-4 h-4" />
                        <span>Pendientes</span>
                    </div>
                    <span className="font-bold">{notVoted}</span>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Participación Global</span>
                        <span className={`text-lg font-black ${isManual ? 'text-primary' : 'text-emerald-500'}`}>
                            {participationPercentage.toFixed(2)}%
                        </span>
                    </div>
                    <Progress 
                        value={participationPercentage} 
                        indicatorColor={isManual ? 'bg-primary' : 'bg-emerald-500'}
                    />
                </div>

                {isManual && (
                    <p className="text-[10px] text-gray-500 italic text-center mt-2">
                        * Los cambios manuales no afectan a la base de datos real.
                    </p>
                )}
            </CardContent>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}} />
        </Card>
    );
};

export default SummaryCard;
