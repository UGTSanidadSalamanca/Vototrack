
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UNIONS, calculateElectionResults } from '../lib/electionUtils';
import { ElectionData, Voter } from '../types';
import { BarChart3, Save, RotateCcw, CheckCircle2, AlertTriangle, Printer, FileDown, ShieldCheck, Settings2 } from 'lucide-react';

interface ElectionResultsProps {
    voters: Voter[];
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ voters }) => {
    const DEFAULT_VOTES = {
        'UGT': 0,
        'CCOO': 0,
        'CSIF': 0,
        'CGT': 0,
        'SATSE': 0,
        'SAE': 0,
        'TCAE CAUSA': 0,
        'CEMS': 0,
        'CTS': 0,
        'SINGEFE': 0
    };

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

    const results = useMemo(() => calculateElectionResults(electionData, electionData.totalSeats), [electionData]);
    
    // Ahora usamos el censo real pasado por props, o un mínimo de 1 para evitar división por cero
    const totalCensus = voters.length || 7300; 
    const votesInBox = electionData.blankVotes + electionData.nullVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0);
    const participationRate = totalCensus > 0 ? (votesInBox / totalCensus) * 100 : 0;

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
        alert('Datos de escrutinio guardados.');
    };

    const handleReset = () => {
        if(confirm('¿Seguro que quieres borrar todos los datos?')) {
            setElectionData({
                blankVotes: 0,
                nullVotes: 0,
                totalSeats: 35,
                unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
            });
        }
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
                    <div className="p-3 bg-primary/20 rounded-xl">
                        <ShieldCheck className="text-primary w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Escrutinio Profesional</h2>
                        <p className="text-gray-400 text-sm">Cálculo proporcional por Restos Mayores</p>
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
                    <Card className="bg-primary/5 border-primary/20 kpi-card">
                        <CardContent className="p-5 text-center">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Votos Emitidos</p>
                            <p className="text-4xl font-black">{votesInBox}</p>
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
                            <p className="text-4xl font-black text-white print:text-black">{electionData.totalSeats}</p>
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
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Número Total de Delegados</label>
                                    <Input 
                                        type="number" 
                                        className="font-black border-primary/30 bg-primary/5 text-primary text-lg h-12" 
                                        value={electionData.totalSeats} 
                                        onChange={(e) => handleSeatsChange(e.target.value)} 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 shadow-xl bg-card">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                                <CardTitle className="text-sm font-bold">Votos</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="Blanco" type="number" value={electionData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                                    <Input placeholder="Nulo" type="number" value={electionData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-4 border-t border-white/5">
                                    {electionData.unionVotes.map(uv => (
                                        <div key={uv.union} className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-bold text-gray-300 truncate">{uv.union}</span>
                                            <Input type="number" className="w-20 h-8 text-right text-xs" value={uv.votes} onChange={(e) => handleVoteChange(uv.union, e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button className="flex-1" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Guardar</Button>
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
                                    <span>Censo Real:</span>
                                    <span>{totalCensus}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ElectionResults;
