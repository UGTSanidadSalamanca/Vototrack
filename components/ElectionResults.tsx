
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
    
    // Censo manual para simulaciones
    const realCensus = voters.length || 0;
    const [manualCensus, setManualCensus] = useState<number>(realCensus || 2000);

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
    
    // Cálculos de votos y participación
    const votesInBox = electionData.blankVotes + electionData.nullVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0);
    const activeCensus = isCalculatorMode ? manualCensus : realCensus;
    const participationRate = activeCensus > 0 ? (votesInBox / activeCensus) * 100 : 0;

    const handleVoteChange = (union: string | null, value: string) => {
        const numValue = Math.max(0, parseInt(value) || 0);
        setElectionData(prev => {
            if (union === null) return { ...prev, blankVotes: numValue };
            if (union === 'null') return { ...prev, nullVotes: numValue };
            return {
                ...prev,
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
        alert('Datos guardados correctamente.');
    };

    const handleReset = () => {
        if(confirm('¿Seguro que quieres borrar todos los datos introducidos?')) {
            setElectionData({
                blankVotes: 0,
                nullVotes: 0,
                totalSeats: 35,
                unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
            });
            if (isCalculatorMode) setManualCensus(realCensus);
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
                    .results-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 15px !important; }
                    .table-compact td, .table-compact th { padding: 4px 8px !important; font-size: 9.5pt !important; border-bottom: 0.5pt solid #f1f5f9 !important; color: black !important; }
                    .kpi-card { background-color: #f8fafc !important; border: 1.5pt solid #e2e8f0 !important; color: black !important; }
                    .distribution-bar { height: 14mm !important; border: 1px solid #cbd5e1 !important; margin: 4mm 0 !important; border-radius: 6px !important; }
                    .distribution-bar span { color: white !important; font-weight: 800 !important; }
                    h1, h2, h3, h4, p, span { color: black !important; }
                    .text-primary { color: #2563eb !important; }
                    .text-accent { color: #10b981 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* CABECERA CON SELECTOR DE MODO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-card p-5 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${isCalculatorMode ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}>
                        {isCalculatorMode ? <Calculator className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            {isCalculatorMode ? 'Calculadora Electoral' : 'Escrutinio Real'}
                            {isCalculatorMode && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full uppercase font-black">Simulación</span>}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isCalculatorMode ? 'Ajusta censo y delegados para simular escenarios' : 'Basado en los datos reales del censo y votación'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <Button 
                            variant={!isCalculatorMode ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-[10px] uppercase font-bold"
                            onClick={() => setIsCalculatorMode(false)}
                        >
                            <Database className="w-3 h-3 mr-1.5" /> Real
                        </Button>
                        <Button 
                            variant={isCalculatorMode ? 'accent' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-[10px] uppercase font-bold"
                            onClick={() => setIsCalculatorMode(true)}
                        >
                            <Calculator className="w-3 h-3 mr-1.5" /> Calculadora
                        </Button>
                    </div>
                    <Button variant="default" onClick={() => window.print()} className="bg-primary hover:bg-primary/90 h-10 px-4">
                        <Printer className="w-4 h-4 mr-2" /> PDF
                    </Button>
                </div>
            </div>

            <div className="report-container space-y-6">
                {/* CABECERA IMPRESIÓN */}
                <div className="print-only border-b-4 border-blue-600 pb-5 mb-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-blue-600 w-10 h-10" />
                            <div>
                                <h1 className="text-3xl font-black text-blue-900 tracking-tighter leading-none">VotoTrack PRO</h1>
                                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.3em] mt-1">
                                    {isCalculatorMode ? 'Simulación de Escenario Electoral' : 'Acta de Escrutinio Provisional'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-wider">SACYL - JUNTA DE PERSONAL</p>
                            <p className="text-slate-500 font-medium italic">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* KPIs EDITABLES EN MODO CALCULADORA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`kpi-card transition-all duration-300 ${isCalculatorMode ? 'border-amber-500/30 bg-amber-500/5' : 'border-primary/20 bg-primary/5'}`}>
                        <CardContent className="p-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCalculatorMode ? 'text-amber-500' : 'text-primary'}`}>Votos Emitidos (Suma)</p>
                            <p className="text-4xl font-black text-white print:text-black">{votesInBox}</p>
                            <p className="text-[9px] text-gray-500 mt-1">Candidaturas + Blanco + Nulo</p>
                        </CardContent>
                    </Card>

                    <Card className={`kpi-card transition-all duration-300 ${isCalculatorMode ? 'border-amber-500/30 bg-amber-500/5 ring-2 ring-amber-500/20' : 'border-accent/20 bg-accent/5'}`}>
                        <CardContent className="p-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCalculatorMode ? 'text-amber-500' : 'text-accent'}`}>Censo (Votantes Totales)</p>
                            {isCalculatorMode ? (
                                <div className="flex flex-col items-center">
                                    <Input 
                                        type="number" 
                                        className="w-32 text-center text-3xl font-black bg-white/10 border-amber-500/30 h-12"
                                        value={manualCensus}
                                        onChange={(e) => setManualCensus(Math.max(1, parseInt(e.target.value) || 0))}
                                    />
                                    <span className="text-[10px] text-amber-500/60 mt-1 uppercase font-bold">Ajuste Manual</span>
                                </div>
                            ) : (
                                <p className="text-4xl font-black text-white print:text-black">{realCensus}</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={`kpi-card transition-all duration-300 ${isCalculatorMode ? 'border-amber-500/30 bg-amber-500/5 ring-2 ring-amber-500/20' : 'border-white/10 bg-white/5'}`}>
                        <CardContent className="p-6 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCalculatorMode ? 'text-amber-500' : 'text-gray-400'}`}>Delegados a Elegir</p>
                            {isCalculatorMode ? (
                                <div className="flex flex-col items-center">
                                    <Input 
                                        type="number" 
                                        className="w-32 text-center text-3xl font-black bg-white/10 border-amber-500/30 h-12"
                                        value={electionData.totalSeats}
                                        onChange={(e) => handleSeatsChange(e.target.value)}
                                    />
                                    <span className="text-[10px] text-amber-500/60 mt-1 uppercase font-bold">Ajuste Manual</span>
                                </div>
                            ) : (
                                <p className="text-4xl font-black text-white print:text-black">{electionData.totalSeats}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 results-grid">
                    {/* PANEL DE DATOS */}
                    <Card className={`border-white/10 bg-card no-print shadow-xl ${isCalculatorMode ? 'ring-1 ring-amber-500/20' : ''}`}>
                        <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-primary" />
                                {isCalculatorMode ? 'Simular Votos' : 'Escrutinio Real'}
                            </CardTitle>
                            <p className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                                Participación: {participationRate.toFixed(2)}%
                            </p>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Blanco</label>
                                    <Input type="number" className="bg-white/5 font-bold" value={electionData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Nulo</label>
                                    <Input type="number" className="bg-white/5 font-bold text-destructive" value={electionData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-white/5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                {electionData.unionVotes.map(uv => (
                                    <div key={uv.union} className="flex items-center justify-between gap-2 group">
                                        <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors">{uv.union}</span>
                                        <Input 
                                            type="number" 
                                            className="w-20 h-8 text-right text-xs font-black border-white/5 bg-white/5 focus:border-primary/40" 
                                            value={uv.votes} 
                                            onChange={(e) => handleVoteChange(uv.union, e.target.value)} 
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button className="flex-1 font-bold" onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" /> Guardar Escenario
                                </Button>
                                <Button variant="outline" className="border-white/10" onClick={handleReset} title="Reiniciar Calculadora">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TABLA DE RESULTADOS */}
                    <Card className="border-white/10 bg-card shadow-xl">
                        <CardHeader className="border-b border-white/5 bg-white/5 print:bg-transparent">
                            <CardTitle className="text-sm font-black text-white print:text-black flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Reparto de Escaños (Restos Mayores)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <table className="w-full table-compact">
                                <thead>
                                    <tr className="text-[10px] uppercase text-gray-500 font-black border-b border-white/5 print:border-slate-200">
                                        <th className="py-2 text-left">Sigla</th>
                                        <th className="py-2 text-right">Votos</th>
                                        <th className="py-2 text-right">%</th>
                                        <th className="py-2 text-right text-primary print:text-blue-700">Deleg.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 print:divide-slate-50">
                                    {results.sort((a,b) => b.finalSeats - a.finalSeats || b.votes - a.votes).map(r => (
                                        <tr key={r.union} className={`${r.excluded ? 'opacity-30' : 'hover:bg-white/5'}`}>
                                            <td className="py-2.5 font-bold text-gray-200 print:text-black">{r.union}</td>
                                            <td className="py-2.5 text-right font-medium">{r.votes}</td>
                                            <td className="py-2.5 text-right text-gray-500">{r.percentage.toFixed(1)}%</td>
                                            <td className="py-2.5 text-right font-black text-primary print:text-blue-700">
                                                {r.finalSeats > 0 ? <span className="bg-primary/10 print:bg-blue-50 px-2 py-0.5 rounded">{r.finalSeats}</span> : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-6 pt-4 border-t border-white/5 print:border-slate-200 space-y-2 text-[10px] font-bold text-gray-500">
                                <div className="flex justify-between"><span>Votos a candidaturas:</span><span>{electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span></div>
                                <div className="flex justify-between text-white print:text-black font-black pt-2 border-t border-white/5 print:border-slate-200 text-xs">
                                    <span>Votos Válidos (Base 5%):</span>
                                    <span>{electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GRÁFICO DISTRIBUCIÓN */}
                    <Card className="lg:col-span-2 border-white/10 bg-card overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-4 print:bg-transparent">
                            <CardTitle className="text-sm font-black text-white print:text-black">
                                Representación Gráfica de la Nueva Junta ({electionData.totalSeats} Delegados)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex h-16 w-full rounded-xl border border-white/10 print:border-slate-300 overflow-hidden distribution-bar bg-white/5 shadow-inner">
                                {results.filter(r => r.finalSeats > 0).map((r, i) => (
                                    <div 
                                        key={r.union} 
                                        className="h-full flex flex-col items-center justify-center text-[10px] font-black border-r border-white/30 last:border-0"
                                        style={{ 
                                            backgroundColor: `hsl(${200 + (i * 20)}, 70%, 50%)`, 
                                            width: `${(r.finalSeats / electionData.totalSeats) * 100}%`,
                                            color: 'white'
                                        }}
                                    >
                                        <span className="truncate w-full text-center px-1 uppercase tracking-tighter">{r.union}</span>
                                        <span className="text-sm bg-black/20 px-1.5 rounded">{r.finalSeats}</span>
                                    </div>
                                ))}
                                {results.every(r => r.finalSeats === 0) && (
                                    <div className="w-full flex items-center justify-center text-gray-600 font-bold uppercase text-xs">
                                        Sin datos de asignación
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] text-gray-500 no-print">
                                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Barrera Electoral 5% Aplicada</div>
                                <div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-accent" /> Algoritmo Restos Mayores</div>
                                <div className="flex items-center gap-2 italic">Ref: {isCalculatorMode ? 'CALC' : 'REAL'}-{Date.now().toString(16).toUpperCase()}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PIE FIRMAS IMPRESIÓN */}
                <div className="print-only text-center text-[8pt] text-slate-400 border-t border-slate-200 pt-8 mt-12">
                    <div className="flex justify-between items-start text-left mb-10">
                        <div className="w-1/4 border-t border-slate-300 pt-2"><p className="font-bold text-slate-800 uppercase text-[7px]">Presidente de Mesa</p></div>
                        <div className="w-1/4 border-t border-slate-300 pt-2 text-right"><p className="font-bold text-slate-800 uppercase text-[7px]">Secretario de Mesa</p></div>
                    </div>
                    <p className="font-bold text-slate-700 italic">Este documento es una simulación informativa generada por VotoTrack PRO.</p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
        </div>
    );
};

export default ElectionResults;
