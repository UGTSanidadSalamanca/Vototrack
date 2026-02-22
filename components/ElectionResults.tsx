
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UNIONS, calculateElectionResults } from '../lib/electionUtils';
import { ElectionData, Voter } from '../types';
import { BarChart3, Save, RotateCcw, CheckCircle2, AlertTriangle, Printer, FileDown, ShieldCheck, Settings2, Calculator, Info } from 'lucide-react';

interface ElectionResultsProps {
    voters: Voter[];
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ voters }) => {
    const [mode, setMode] = useState<'real' | 'sim'>('real');
    
    const [electionData, setElectionData] = useState<ElectionData>(() => {
        const saved = localStorage.getItem('voto-track-election-results');
        if (saved) return JSON.parse(saved);
        
        return {
            blankVotes: 0,
            nullVotes: 0,
            totalSeats: 35,
            unionVotes: UNIONS.map(u => ({ 
                union: u, 
                votes: 0 
            }))
        };
    });

    const [simData, setSimData] = useState<ElectionData & { totalCensus: number }>(() => {
        const saved = localStorage.getItem('voto-track-sim-results');
        if (saved) return JSON.parse(saved);
        return {
            blankVotes: 0,
            nullVotes: 0,
            totalSeats: 35,
            totalCensus: voters.length || 7300,
            unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
        };
    });

    const [participationSource, setParticipationSource] = useState<'app' | 'manual'>('app');
    
    const currentData = mode === 'real' ? electionData : simData;
    const results = useMemo(() => calculateElectionResults(currentData, currentData.totalSeats), [currentData, mode]);
    
    const appTurnout = voters.filter(v => v.haVotado).length;
    const totalCensus = mode === 'real' ? (voters.length || 7300) : simData.totalCensus; 
    const manualVotesSum = currentData.blankVotes + currentData.nullVotes + currentData.unionVotes.reduce((acc, v) => acc + v.votes, 0);
    
    const votesInBox = participationSource === 'app' && mode === 'real' ? appTurnout : manualVotesSum;
    const participationRate = totalCensus > 0 ? (votesInBox / totalCensus) * 100 : 0;

    const handleVoteChange = (union: string | null, value: string) => {
        const numValue = Math.max(0, parseInt(value) || 0);
        if (mode === 'real') {
            setElectionData(prev => {
                if (union === null) return { ...prev, blankVotes: numValue };
                if (union === 'null') return { ...prev, nullVotes: numValue };
                return {
                    ...prev,
                    unionVotes: prev.unionVotes.map(uv => uv.union === union ? { ...uv, votes: numValue } : uv)
                };
            });
        } else {
            setSimData(prev => {
                if (union === null) return { ...prev, blankVotes: numValue };
                if (union === 'null') return { ...prev, nullVotes: numValue };
                return {
                    ...prev,
                    unionVotes: prev.unionVotes.map(uv => uv.union === union ? { ...uv, votes: numValue } : uv)
                };
            });
        }
    };

    const handleSeatsChange = (value: string) => {
        const numValue = Math.max(1, parseInt(value) || 1);
        if (mode === 'real') {
            setElectionData(prev => ({ ...prev, totalSeats: numValue }));
        } else {
            setSimData(prev => ({ ...prev, totalSeats: numValue }));
        }
    };

    const handleCensusChange = (value: string) => {
        const numValue = Math.max(1, parseInt(value) || 1);
        setSimData(prev => ({ ...prev, totalCensus: numValue }));
    };

    const handleSave = () => {
        if (mode === 'real') {
            localStorage.setItem('voto-track-election-results', JSON.stringify(electionData));
            alert('Datos de escrutinio REAL guardados.');
        } else {
            localStorage.setItem('voto-track-sim-results', JSON.stringify(simData));
            alert('Simulación guardada.');
        }
    };

    const handleReset = () => {
        if(confirm(`¿Seguro que quieres borrar todos los datos del modo ${mode === 'real' ? 'REAL' : 'SIMULADOR'}?`)) {
            if (mode === 'real') {
                setElectionData({
                    blankVotes: 0,
                    nullVotes: 0,
                    totalSeats: 35,
                    unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
                });
            } else {
                setSimData({
                    blankVotes: 0,
                    nullVotes: 0,
                    totalSeats: 35,
                    totalCensus: voters.length || 7300,
                    unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
                });
            }
        }
    };

    const handleLoadRealToSim = () => {
        setSimData({
            ...electionData,
            totalCensus: voters.length || 7300
        });
        alert('Datos reales cargados en el simulador.');
    };

    const handlePrint = () => { window.print(); };

    const handleExportCSV = () => {
        const headers = ["Sindicato", "Votos", "Porcentaje", "Delegados"];
        const rows = results.map(r => [r.union, r.votes, `${r.percentage.toFixed(2)}%`, r.finalSeats]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Resultados_Escrutinio.csv`);
        link.click();
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    html, body { background: white !important; color: black !important; font-family: 'Inter', sans-serif !important; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .report-container { display: block !important; width: 100% !important; background: white !important; }
                    .card { border: 1px solid #e2e8f0 !important; background: white !important; color: black !important; box-shadow: none !important; margin-bottom: 4mm !important; break-inside: avoid; border-radius: 8px !important; }
                    .kpi-card { background-color: #f8fafc !important; border: 1.5pt solid #e2e8f0 !important; color: black !important; }
                    .distribution-bar { height: 14mm !important; border: 1px solid #cbd5e1 !important; margin: 4mm 0 !important; border-radius: 6px !important; }
                    .text-primary { color: #2563eb !important; }
                }
                .print-only { display: none; }
            `}} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white/5 p-5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${mode === 'real' ? 'bg-primary/20' : 'bg-amber-500/20'}`}>
                        {mode === 'real' ? <ShieldCheck className="text-primary w-8 h-8" /> : <Calculator className="text-amber-500 w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {mode === 'real' ? 'Escrutinio Profesional' : 'Calculadora de Escaños'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button 
                                    onClick={() => setMode('real')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'real' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Real
                                </button>
                                <button 
                                    onClick={() => setMode('sim')}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${mode === 'sim' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Simulador
                                </button>
                            </div>
                            {mode === 'sim' && (
                                <Button variant="ghost" size="sm" onClick={handleLoadRealToSim} className="h-7 text-[10px] font-bold text-amber-500 hover:bg-amber-500/10 border border-amber-500/20">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Cargar Datos Reales
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleExportCSV} className="border-white/10 hover:bg-white/5 h-11">
                        <FileDown className="w-4 h-4 mr-2" /> Excel
                    </Button>
                    <Button variant="default" onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 h-11 px-6">
                        <Printer className="w-4 h-4 mr-2" /> Informe PDF
                    </Button>
                </div>
            </div>

            <div className="report-container space-y-6">
                <div className="print-only border-b-4 border-blue-600 pb-5 mb-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-blue-900 tracking-tighter leading-none">VotoTrack PRO</h1>
                                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mt-1">Acta de Escrutinio Provisional</p>
                            </div>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-black text-slate-900 text-sm mb-1">JUNTA DE PERSONAL - SACYL</p>
                            <p className="text-slate-500 font-medium italic">{new Date().toLocaleDateString('es-ES')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`${mode === 'real' ? 'bg-primary/5 border-primary/20' : 'bg-amber-500/5 border-amber-500/20'} kpi-card relative overflow-hidden`}>
                        <CardContent className="p-5 text-center">
                            <div className="flex flex-col items-center">
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${mode === 'real' ? 'text-primary' : 'text-amber-500'}`}>Votos Emitidos</p>
                                <p className="text-4xl font-black">{votesInBox}</p>
                                
                                {mode === 'real' && (
                                    <div className="flex mt-3 bg-black/20 p-0.5 rounded-lg border border-white/5 no-print">
                                        <button 
                                            onClick={() => setParticipationSource('app')}
                                            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${participationSource === 'app' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            App
                                        </button>
                                        <button 
                                            onClick={() => setParticipationSource('manual')}
                                            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${participationSource === 'manual' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Manual
                                        </button>
                                    </div>
                                )}
                                {mode === 'real' && participationSource === 'manual' && appTurnout !== manualVotesSum && (
                                    <p className="text-[8px] text-gray-500 mt-1 font-bold">App: {appTurnout}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-accent/5 border-accent/20 kpi-card">
                        <CardContent className="p-5 text-center">
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Participación</p>
                            <p className="text-4xl font-black">{participationRate.toFixed(2)}%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 kpi-card">
                        <CardContent className="p-5 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delegados a Elegir</p>
                            <p className="text-4xl font-black text-white print:text-black">{currentData.totalSeats}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 results-grid">
                    <div className="space-y-6 no-print">
                        <Card className="border-white/10 shadow-xl bg-card overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-primary" />
                                    Configuración
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Delegados</label>
                                        <Input 
                                            type="number" 
                                            className={`font-black text-lg h-12 ${mode === 'real' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-amber-500/30 bg-amber-500/5 text-amber-500'}`} 
                                            value={currentData.totalSeats} 
                                            onChange={(e) => handleSeatsChange(e.target.value)} 
                                        />
                                    </div>
                                    {mode === 'sim' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Censo para Simulación</label>
                                            <Input 
                                                type="number" 
                                                className="font-black border-white/10 bg-white/5 text-white text-lg h-12" 
                                                value={simData.totalCensus} 
                                                onChange={(e) => handleCensusChange(e.target.value)} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 shadow-xl bg-card">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                                <CardTitle className="text-sm font-bold">Votos</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Blanco</label>
                                        <Input type="number" value={currentData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Nulo</label>
                                        <Input type="number" value={currentData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-4 border-t border-white/5">
                                    {currentData.unionVotes.map(uv => (
                                        <div key={uv.union} className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-bold text-gray-300 truncate">{uv.union}</span>
                                            <Input type="number" className="w-20 h-8 text-right text-xs" value={uv.votes} onChange={(e) => handleVoteChange(uv.union, e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button className={`flex-1 ${mode === 'sim' ? 'bg-amber-500 hover:bg-amber-600' : ''}`} onClick={handleSave}>
                                        <Save className="w-4 h-4 mr-2" /> {mode === 'real' ? 'Guardar' : 'Guardar Sim'}
                                    </Button>
                                    <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="lg:col-span-1 border-white/10 shadow-xl bg-card">
                        <CardHeader className="border-b border-white/5 pb-4 bg-white/5 print:bg-transparent">
                            <CardTitle className="text-base font-black text-white print:text-black">Resultados por Candidatura</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 print:border-slate-200 text-[10px] text-gray-500 font-black">
                                        <th className="py-2 text-left">Siglas</th>
                                        <th className="py-2 text-right">Votos</th>
                                        <th className="py-2 text-right">% Válido</th>
                                        <th className="py-2 text-right text-primary">Delegados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 print:divide-slate-50">
                                    {results.sort((a,b) => b.finalSeats - a.finalSeats || b.votes - a.votes).map(r => (
                                        <tr key={r.union} className={r.excluded ? 'opacity-30' : ''}>
                                            <td className="py-2 font-bold">{r.union}</td>
                                            <td className="py-2 text-right">{r.votes}</td>
                                            <td className="py-2 text-right text-gray-500">{r.percentage.toFixed(1)}%</td>
                                            <td className="py-2 text-right font-black text-primary text-sm">
                                                {r.finalSeats > 0 ? r.finalSeats : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] font-bold text-gray-500">
                                <div className="flex justify-between">
                                    <span>Votos Válidos:</span>
                                    <span>{electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                                </div>
                                <div className="flex justify-between text-white print:text-black mt-1">
                                    <span>{mode === 'real' ? 'Censo Real:' : 'Censo Simulado:'}</span>
                                    <span>{totalCensus}</span>
                                </div>
                                {mode === 'sim' && (
                                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded flex items-start gap-2">
                                        <Info className="w-3 h-3 text-amber-500 mt-0.5" />
                                        <p className="text-[9px] text-amber-200/70 leading-tight">
                                            Estás en modo simulador. Los cambios aquí no afectan a los datos reales de la elección.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ElectionResults;
