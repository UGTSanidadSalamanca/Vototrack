
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UNIONS, calculateElectionResults } from '../lib/electionUtils';
import { ElectionData, Voter } from '../types';
import { BarChart3, Save, RotateCcw, CheckCircle2, AlertTriangle, Printer, FileDown, ShieldCheck, Settings2, Calculator, Database } from 'lucide-react';

interface ElectionResultsProps {
    voters: Voter[];
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ voters }) => {
    // Estado para el modo (Real vs Calculadora)
    const [isCalculatorMode, setIsCalculatorMode] = useState(false);
    
    // Estados manuales para el Modo Calculadora
    const realCensus = voters.length || 0;
    const [manualCensus, setManualCensus] = useState<number>(realCensus || 2000);
    const [manualVotesTotal, setManualVotesTotal] = useState<number | null>(null);

    const DEFAULT_VOTES = {
        'UGT': 150, 'CCOO': 120, 'CSIF': 210, 'CGT': 85, 'SATSE': 240, 
        'SAE': 105, 'TCAE CAUSA': 95, 'CEMS': 190, 'CTS': 75, 'SINGEFE': 60
    };

    const [electionData, setElectionData] = useState<ElectionData>(() => {
        const saved = localStorage.getItem('voto-track-election-results');
        if (saved) return JSON.parse(saved);
        
        return {
            blankVotes: 12,
            nullVotes: 5,
            totalSeats: 35,
            unionVotes: UNIONS.map(u => ({ 
                union: u, 
                votes: DEFAULT_VOTES[u as keyof typeof DEFAULT_VOTES] || 0 
            }))
        };
    });

    const results = useMemo(() => calculateElectionResults(electionData, electionData.totalSeats), [electionData]);
    
    // Cálculos de votos reales (suma de partes)
    const votesSum = electionData.blankVotes + electionData.nullVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0);
    
    // Valores a mostrar según el modo
    const activeVotesInBox = (isCalculatorMode && manualVotesTotal !== null) ? manualVotesTotal : votesSum;
    const activeCensus = isCalculatorMode ? manualCensus : realCensus;
    const participationRate = activeCensus > 0 ? (activeVotesInBox / activeCensus) * 100 : 0;

    const handleVoteChange = (union: string | null, value: string) => {
        const numValue = Math.max(0, parseInt(value) || 0);
        setElectionData(prev => {
            if (union === null) return { ...prev, blankVotes: numValue };
            if (union === 'null') return { ...prev, nullVotes: numValue };
            return {
                prev,
                unionVotes: prev.unionVotes.map(uv => uv.union === union ? { ...uv, votes: numValue } : uv)
            };
        });
    };

    const handleSeatsChange = (value: string) => {
        const numValue = Math.max(1, parseInt(value) || 1);
        setElectionData(prev => ({ ...prev, totalSeats: numValue }));
    };

    const handleSave = () => {
        localStorage.setItem('voto-track-election-results', JSON.stringify(electionData));
        alert('Datos de escrutinio guardados correctamente.');
    };

    const handleReset = () => {
        if(confirm('¿Seguro que quieres borrar todos los datos introducidos en la calculadora?')) {
            setElectionData({
                blankVotes: 0,
                nullVotes: 0,
                totalSeats: 35,
                unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
            });
            setManualCensus(realCensus);
            setManualVotesTotal(null);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* ESTILOS DE IMPRESIÓN */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    html, body { background: white !important; color: black !important; font-family: 'Inter', sans-serif !important; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .card { border: 1px solid #e2e8f0 !important; background: white !important; color: black !important; box-shadow: none !important; margin-bottom: 4mm !important; break-inside: avoid; border-radius: 8px !important; }
                    .kpi-card { background-color: #f8fafc !important; border: 1.5pt solid #e2e8f0 !important; color: black !important; }
                    h1, h2, h3, h4, p, span { color: black !important; }
                    .text-primary { color: #2563eb !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* CABECERA CON SELECTOR DE MODO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-card p-5 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-500 ${isCalculatorMode ? 'bg-amber-500/20 text-amber-500 rotate-12 scale-110' : 'bg-primary/20 text-primary'}`}>
                        {isCalculatorMode ? <Calculator className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            {isCalculatorMode ? 'Calculadora Electoral PRO' : 'Escrutinio Real'}
                            {isCalculatorMode && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full uppercase font-black animate-pulse">Modo Simulador</span>}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isCalculatorMode ? 'Simula participación y reparto ajustando cualquier valor' : 'Resultados basados en la urna y censo real'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shadow-inner">
                        <Button 
                            variant={!isCalculatorMode ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-[10px] uppercase font-black tracking-tighter"
                            onClick={() => setIsCalculatorMode(false)}
                        >
                            <Database className="w-3 h-3 mr-1.5" /> Recuento Real
                        </Button>
                        <Button 
                            variant={isCalculatorMode ? 'accent' : 'ghost'} 
                            size="sm" 
                            className={`h-8 text-[10px] uppercase font-black tracking-tighter transition-all ${isCalculatorMode ? 'bg-amber-500 hover:bg-amber-600 text-black' : ''}`}
                            onClick={() => setIsCalculatorMode(true)}
                        >
                            <Calculator className="w-3 h-3 mr-1.5" /> Calculadora
                        </Button>
                    </div>
                    <Button variant="default" onClick={() => window.print()} className="bg-primary hover:bg-primary/90 h-10 px-4 font-bold shadow-lg shadow-primary/20">
                        <Printer className="w-4 h-4 mr-2" /> Informe PDF
                    </Button>
                </div>
            </div>

            <div className="report-container space-y-6">
                {/* KPIs EDITABLES EN MODO CALCULADORA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* VOTOS EMITIDOS (EDITABLE) */}
                    <Card className={`kpi-card transition-all duration-300 ${isCalculatorMode ? 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10 shadow-xl ring-2 ring-amber-500/20' : 'border-primary/20 bg-primary/5'}`}>
                        <CardContent className="p-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCalculatorMode ? 'text-amber-500' : 'text-primary'}`}>Votos Emitidos</p>
                            {isCalculatorMode ? (
                                <div className="flex flex-col items-center">
                                    <Input 
                                        type="number" 
                                        className="w-full max-w-[180px] text-center text-4xl font-black bg-white/10 border-amber-500/30 h-14 focus:border-amber-500"
                                        value={manualVotesTotal !== null ? manualVotesTotal : votesSum}
                                        onChange={(e) => setManualVotesTotal(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-[9px] text-amber-500/70 mt-2 uppercase font-black tracking-tight flex items-center gap-1">
                                        <Settings2 className="w-3 h-3" /> Entrada Manual Ficticia
                                    </span>
                                </div>
                            ) : (
                                <p className="text-5xl font-black text-white print:text-black">{votesSum}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* CENSO (EDITABLE) */}
                    <Card className={`kpi-card transition-all duration-300 ${isCalculatorMode ? 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10 shadow-xl ring-2 ring-amber-500/20' : 'border-accent/20 bg-accent/5'}`}>
                        <CardContent className="p-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCalculatorMode ? 'text-amber-500' : 'text-accent'}`}>Censo Simulado</p>
                            {isCalculatorMode ? (
                                <div className="flex flex-col items-center">
                                    <Input 
                                        type="number" 
                                        className="w-full max-w-[180px] text-center text-4xl font-black bg-white/10 border-amber-500/30 h-14 focus:border-amber-500"
                                        value={manualCensus}
                                        onChange={(e) => setManualCensus(Math.max(1, parseInt(e.target.value) || 0))}
                                    />
                                    <span className="text-[10px] text-white font-black mt-2 bg-accent/30 px-2 py-0.5 rounded">
                                        {participationRate.toFixed(2)}% Part.
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <p className="text-5xl font-black text-white print:text-black">{realCensus}</p>
                                    <p className="text-xl font-bold text-accent mt-1">{participationRate.toFixed(2)}%</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* DELEGADOS (EDITABLE) */}
                    <Card className={`kpi-card transition-all duration-300 ${isCalculatorMode ? 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10 shadow-xl ring-2 ring-amber-500/20' : 'border-white/10 bg-white/5'}`}>
                        <CardContent className="p-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCalculatorMode ? 'text-amber-500' : 'text-gray-400'}`}>Delegados a Repartir</p>
                            {isCalculatorMode ? (
                                <div className="flex flex-col items-center">
                                    <Input 
                                        type="number" 
                                        className="w-full max-w-[180px] text-center text-4xl font-black bg-white/10 border-amber-500/30 h-14 focus:border-amber-500"
                                        value={electionData.totalSeats}
                                        onChange={(e) => handleSeatsChange(e.target.value)}
                                    />
                                    <span className="text-[9px] text-amber-500/70 mt-2 uppercase font-black tracking-tight">Tamaño de la Junta</span>
                                </div>
                            ) : (
                                <p className="text-5xl font-black text-white print:text-black">{electionData.totalSeats}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PANEL DE VOTOS POR SINDICATO */}
                    <Card className={`border-white/10 bg-card no-print shadow-2xl transition-all ${isCalculatorMode ? 'ring-1 ring-amber-500/30 border-amber-500/20' : ''}`}>
                        <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-sm font-black flex items-center gap-2">
                                <Settings2 className={`w-4 h-4 ${isCalculatorMode ? 'text-amber-500' : 'text-primary'}`} />
                                {isCalculatorMode ? 'Entrada de Votos de Simulación' : 'Introducción de Resultados Reales'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Votos en Blanco</label>
                                    <Input type="number" className="bg-white/5 font-black h-11 border-white/10" value={electionData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Votos Nulos</label>
                                    <Input type="number" className="bg-white/5 font-black h-11 border-white/10 text-destructive" value={electionData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-white/5 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                                {electionData.unionVotes.map(uv => (
                                    <div key={uv.union} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <span className="text-[11px] font-black text-gray-300 uppercase truncate">{uv.union}</span>
                                        <Input 
                                            type="number" 
                                            className="w-24 h-9 text-right text-xs font-black border-white/5 bg-white/5 focus:border-primary/40 focus:ring-0" 
                                            value={uv.votes} 
                                            onChange={(e) => handleVoteChange(uv.union, e.target.value)} 
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-6 border-t border-white/5">
                                <Button className="flex-1 font-black uppercase text-xs tracking-wider h-12 shadow-lg" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" /> Guardar Datos
                                </Button>
                                <Button variant="outline" className="border-white/10 h-12 px-5" onClick={handleReset} title="Limpiar Calculadora">
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TABLA DE RESULTADOS Y REPARTO */}
                    <Card className="border-white/10 bg-card shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/5 py-4">
                            <CardTitle className="text-sm font-black text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Asignación de Delegados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-black/20 text-[10px] uppercase text-gray-500 font-black border-b border-white/5">
                                        <tr>
                                            <th className="px-6 py-4">Candidatura</th>
                                            <th className="px-6 py-4 text-right">Votos</th>
                                            <th className="px-6 py-4 text-right">% Válido</th>
                                            <th className="px-6 py-4 text-right text-primary">Delegados</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {results.sort((a,b) => b.finalSeats - a.finalSeats || b.votes - a.votes).map(r => (
                                            <tr key={r.union} className={`${r.excluded ? 'opacity-20' : 'hover:bg-white/5'} transition-colors`}>
                                                <td className="px-6 py-4 font-black text-gray-200 text-xs">{r.union}</td>
                                                <td className="px-6 py-4 text-right font-bold text-sm">{r.votes}</td>
                                                <td className="px-6 py-4 text-right text-gray-500 text-xs">{r.percentage.toFixed(1)}%</td>
                                                <td className="px-6 py-4 text-right font-black text-primary text-base">
                                                    {r.finalSeats > 0 ? <span className="bg-primary/10 px-3 py-1 rounded-md border border-primary/20">{r.finalSeats}</span> : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-black/10 border-t border-white/5">
                                <div className="flex justify-between items-center text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                                    <span>Base de cálculo (Votos Válidos):</span>
                                    <span className="text-white bg-white/5 px-2 py-1 rounded">
                                        {electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-600 italic leading-tight mt-4">
                                    * Los votos válidos incluyen votos a candidaturas y votos en blanco. 
                                    La barrera electoral del 5% se aplica sobre el total de votos válidos.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GRÁFICO DISTRIBUCIÓN (JUNTA) */}
                    <Card className="lg:col-span-2 border-white/10 bg-card overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                            <CardTitle className="text-sm font-black text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">Composición Visual de la Junta</span>
                                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded tracking-widest">{electionData.totalSeats} MIEMBROS</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex h-20 w-full rounded-2xl border border-white/10 overflow-hidden distribution-bar bg-black/40 shadow-inner p-1">
                                {results.filter(r => r.finalSeats > 0).map((r, i) => (
                                    <div 
                                        key={r.union} 
                                        className="h-full flex flex-col items-center justify-center text-[10px] font-black border-r border-black/20 last:border-0 relative group"
                                        style={{ 
                                            backgroundColor: `hsl(${210 + (i * 25)}, 75%, 45%)`, 
                                            width: `${(r.finalSeats / electionData.totalSeats) * 100}%`,
                                            color: 'white'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="truncate w-full text-center px-2 uppercase tracking-tighter text-[9px] drop-shadow-md">{r.union}</span>
                                        <span className="text-base bg-black/30 px-2 rounded-lg mt-1 border border-white/10">{r.finalSeats}</span>
                                    </div>
                                ))}
                                {results.every(r => r.finalSeats === 0) && (
                                    <div className="w-full flex items-center justify-center text-gray-700 font-black uppercase text-xs tracking-widest italic">
                                        Introduce votos para ver la composición
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-8 flex flex-wrap justify-between gap-6 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                                    <CheckCircle2 className="w-4 h-4 text-primary" /> Barrera 5% Activa
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                                    <Settings2 className="w-4 h-4 text-accent" /> Ley de Restos Mayores
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 italic opacity-50">
                                    ID SIM: VT-{Date.now().toString(16).toUpperCase().slice(-6)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
                
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                input[type=number] {
                  -moz-appearance: textfield;
                }
            `}} />
        </div>
    );
};

export default ElectionResults;
