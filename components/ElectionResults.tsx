
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UNIONS, calculateElectionResults } from '../lib/electionUtils';
import { ElectionData, Voter } from '../types';
import { BarChart3, Save, RotateCcw, CheckCircle2, AlertTriangle, Printer, FileDown, ShieldCheck } from 'lucide-react';

interface ElectionResultsProps {
    voters: Voter[];
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ voters }) => {
    // Valores por defecto para demostración inmediata
    const DEFAULT_VOTES = {
        'SATSE': 240,
        'CSIF': 210,
        'CESM-TISCYL': 190,
        'UGT': 150,
        'CCOO': 120,
        'USAIE-SAE': 105,
        'TCAE-CAUSA': 95,
        'CGT': 85,
        'USCAL': 75,
        'ASPES': 70
    };

    const [electionData, setElectionData] = useState<ElectionData>(() => {
        const saved = localStorage.getItem('voto-track-election-results');
        if (saved) return JSON.parse(saved);
        
        return {
            blankVotes: 12,
            nullVotes: 5,
            unionVotes: UNIONS.map(u => ({ 
                union: u, 
                votes: DEFAULT_VOTES[u as keyof typeof DEFAULT_VOTES] || 0 
            }))
        };
    });

    const results = useMemo(() => calculateElectionResults(electionData), [electionData]);
    
    const totalVoters = voters.length || 2000;
    const votesInBox = electionData.blankVotes + electionData.nullVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0);
    const participationRate = (votesInBox / totalVoters) * 100;

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

    const handleSave = () => {
        localStorage.setItem('voto-track-election-results', JSON.stringify(electionData));
        alert('Datos de escrutinio guardados correctamente.');
    };

    const handleReset = () => {
        if(confirm('¿Seguro que quieres borrar todos los datos introducidos?')) {
            setElectionData({
                blankVotes: 0,
                nullVotes: 0,
                unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["Sindicato", "Votos", "Porcentaje", "Delegados"];
        const rows = results.map(r => [r.union, r.votes, `${r.percentage.toFixed(2)}%`, r.finalSeats]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Resultados_Elecciones.csv`);
        link.click();
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* ESTILOS DE IMPRESIÓN DINÁMICOS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 12mm; }
                    body { background: white !important; color: black !important; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    
                    /* Ajuste de contenedor para una sola página */
                    .report-container { 
                        display: block !important; 
                        width: 100% !important; 
                        max-width: 100% !important;
                    }
                    
                    .card { 
                        border: 1px solid #cbd5e1 !important; 
                        background: white !important; 
                        box-shadow: none !important;
                        margin-bottom: 5mm !important;
                        break-inside: avoid;
                    }

                    .results-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 10px !important;
                    }

                    /* Forzar que el gráfico y la tabla quepan */
                    .table-compact td, .table-compact th { padding: 4px 8px !important; font-size: 10pt !important; }
                    .distribution-bar { height: 10mm !important; }

                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* CABECERA (WEB) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-primary w-7 h-7" />
                        Gestión de Escrutinio
                    </h2>
                    <p className="text-gray-400">Introduce los votos para calcular el reparto de los 35 delegados</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleExportCSV}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Excel (CSV)
                    </Button>
                    <Button variant="default" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Informe PDF / Imprimir
                    </Button>
                </div>
            </div>

            <div className="report-container space-y-6">
                {/* CABECERA OFICIAL (SOLO IMPRESIÓN) */}
                <div className="print-only border-b-2 border-blue-800 pb-4 mb-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-black text-blue-900">VotoTrack PRO - Informe Oficial</h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Escrutinio Provisional de Elecciones Sindicales</p>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-bold">Junta de Personal SACYL</p>
                            <p>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* KPIs PRINCIPALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold text-blue-500 uppercase">Votos Emitidos</p>
                            <p className="text-2xl font-black text-blue-900 dark:text-blue-400">{votesInBox}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase">Participación</p>
                            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-400">{participationRate.toFixed(2)}%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-500/5 border-slate-500/20">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Total Escaños</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">35</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 results-grid">
                    {/* PANEL ENTRADA DATOS */}
                    <Card className="no-print border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Panel de Control de Votos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500">V. Blanco</label>
                                    <Input type="number" className="h-9 font-bold" value={electionData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500">V. Nulos</label>
                                    <Input type="number" className="h-9 font-bold text-red-500" value={electionData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-white/10">
                                {electionData.unionVotes.map(uv => (
                                    <div key={uv.union} className="flex items-center justify-between gap-2 group">
                                        <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{uv.union}</span>
                                        <Input type="number" className="w-16 h-8 text-right text-xs" value={uv.votes} onChange={(e) => handleVoteChange(uv.union, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button className="flex-1" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Guardar Cambios</Button>
                                <Button variant="outline" size="icon" onClick={handleReset} title="Reiniciar escrutinio"><RotateCcw className="w-4 h-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TABLA DE RESULTADOS */}
                    <Card className="lg:col-span-1 border-slate-200 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Escrutinio Detallado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-xs table-compact">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 text-[10px] uppercase text-slate-500">
                                        <th className="py-2 text-left">Candidatura</th>
                                        <th className="py-2 text-right">Votos</th>
                                        <th className="py-2 text-right">%</th>
                                        <th className="py-2 text-right font-bold text-blue-700">Delegados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.sort((a,b) => b.finalSeats - a.finalSeats || b.votes - a.votes).map(r => (
                                        <tr key={r.union} className={r.excluded ? 'opacity-30' : ''}>
                                            <td className="py-2 font-bold">{r.union}</td>
                                            <td className="py-2 text-right">{r.votes}</td>
                                            <td className="py-2 text-right">{r.percentage.toFixed(1)}%</td>
                                            <td className="py-2 text-right font-black text-blue-700 text-sm">{r.finalSeats || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[9px] font-medium text-slate-400">
                                <div className="flex justify-between"><span>Votos a listas:</span><span>{electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span></div>
                                <div className="flex justify-between"><span>Votos en Blanco:</span><span>{electionData.blankVotes}</span></div>
                                <div className="flex justify-between text-slate-900 dark:text-slate-200 font-bold border-t border-slate-100 pt-1">
                                    <span>Base para barrera (5%):</span>
                                    <span>{electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GRÁFICO REPRESENTACIÓN */}
                    <Card className="lg:col-span-2 border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Distribución Visual de la Junta de Personal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-12 w-full rounded-md border border-slate-200 overflow-hidden distribution-bar bg-slate-50">
                                {results.filter(r => r.finalSeats > 0).map((r, i) => (
                                    <div 
                                        key={r.union} 
                                        className="h-full flex flex-col items-center justify-center text-[9px] font-black border-r border-white/20 last:border-0"
                                        style={{ 
                                            backgroundColor: `hsl(${210 + (i * 15)}, 70%, 50%)`, 
                                            width: `${(r.finalSeats / 35) * 100}%`,
                                            color: 'white'
                                        }}
                                        title={`${r.union}: ${r.finalSeats}`}
                                    >
                                        <span className="truncate w-full text-center px-1">{r.union}</span>
                                        <span>{r.finalSeats}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-400 no-print">
                                <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Sistema: Restos Mayores</div>
                                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Barrera Electoral: 5% aplicado</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PIE DE PÁGINA (SOLO IMPRESIÓN) */}
                <div className="print-only text-center text-[8pt] text-slate-400 border-t border-slate-100 pt-4 mt-8">
                    Este documento tiene validez como certificación provisional de resultados. Generado por VotoTrack PRO.
                    <br />
                    ID Verificación: VT-{Math.random().toString(36).substr(2, 9).toUpperCase()} | Página 1 de 1
                </div>
            </div>
        </div>
    );
};

export default ElectionResults;
