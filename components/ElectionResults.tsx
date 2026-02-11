
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
    // Valores de ejemplo actualizados para los nuevos sindicatos
    const DEFAULT_VOTES = {
        'UGT': 150,
        'CCOO': 120,
        'CSIF': 210,
        'CGT': 85,
        'SATSE': 240,
        'SAE': 105,
        'TCAE CAUSA': 95,
        'CEMS': 190,
        'CTS': 75
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

    const handleSeatsChange = (value: string) => {
        const numValue = Math.max(1, parseInt(value) || 1);
        setElectionData(prev => ({ ...prev, totalSeats: numValue }));
    };

    const handleSave = () => {
        localStorage.setItem('voto-track-election-results', JSON.stringify(electionData));
        alert('Datos de escrutinio y configuración guardados correctamente.');
    };

    const handleReset = () => {
        if(confirm('¿Seguro que quieres borrar todos los datos introducidos?')) {
            setElectionData({
                blankVotes: 0,
                nullVotes: 0,
                totalSeats: 35,
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
        link.setAttribute("download", `Resultados_Escrutinio.csv`);
        link.click();
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* ESTILOS DE IMPRESIÓN REFINADOS - MODERNO PERO FONDO BLANCO */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    html, body { 
                        background: white !important; 
                        color: black !important; 
                        font-family: 'Inter', sans-serif !important;
                    }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    
                    .report-container { 
                        display: block !important; 
                        width: 100% !important; 
                        background: white !important;
                    }
                    
                    .card { 
                        border: 1px solid #e2e8f0 !important; 
                        background: white !important; 
                        color: black !important;
                        box-shadow: none !important;
                        margin-bottom: 4mm !important;
                        break-inside: avoid;
                        border-radius: 8px !important;
                    }

                    .results-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 15px !important;
                    }

                    .table-compact td, .table-compact th { 
                        padding: 4px 8px !important; 
                        font-size: 9.5pt !important;
                        border-bottom: 0.5pt solid #f1f5f9 !important;
                        color: black !important;
                    }
                    
                    .kpi-card {
                        background-color: #f8fafc !important;
                        border: 1.5pt solid #e2e8f0 !important;
                        color: black !important;
                    }

                    .distribution-bar { 
                        height: 14mm !important; 
                        border: 1px solid #cbd5e1 !important;
                        margin: 4mm 0 !important;
                        border-radius: 6px !important;
                    }

                    .distribution-bar span { color: white !important; font-weight: 800 !important; }

                    h1, h2, h3, h4, p, span { color: black !important; }
                    .text-primary { color: #2563eb !important; }
                    .text-accent { color: #10b981 !important; }
                    .text-blue-900 { color: #1e3a8a !important; }
                    .text-blue-700 { color: #1d4ed8 !important; }
                    .text-slate-500 { color: #64748b !important; }

                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                }
                .print-only { display: none; }
            `}} />

            {/* CABECERA WEB - ESTÉTICA OSCURA */}
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
                        <FileDown className="w-4 h-4 mr-2" />
                        Excel
                    </Button>
                    <Button variant="default" onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 h-11 px-6">
                        <Printer className="w-4 h-4 mr-2" />
                        Generar Informe PDF
                    </Button>
                </div>
            </div>

            <div className="report-container space-y-6">
                {/* CABECERA INSTITUCIONAL (SOLO IMPRESIÓN) */}
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
                            <p className="text-slate-500 font-medium italic">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>

                {/* RESUMEN KPIs */}
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
                    {/* PANEL DE CONFIGURACIÓN Y DATOS (WEB) */}
                    <div className="space-y-6 no-print">
                        <Card className="border-white/10 shadow-xl bg-card overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-primary" />
                                    Configuración del Proceso
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Número Total de Delegados</label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            className="font-black border-primary/30 bg-primary/5 text-primary text-lg h-12" 
                                            value={electionData.totalSeats} 
                                            onChange={(e) => handleSeatsChange(e.target.value)} 
                                        />
                                        <div className="flex flex-col justify-center text-[10px] text-gray-500 leading-tight">
                                            <span>Basado en el</span>
                                            <span>tamaño del censo</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic mt-1">El número de delegados se calcula según el Art. 76 del Estatuto de los Trabajadores o normativa específica.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 shadow-xl bg-card">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                                <CardTitle className="text-sm font-bold">Introducción de Votos</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Votos en Blanco</label>
                                        <Input type="number" className="font-bold border-white/10 bg-white/5 h-10" value={electionData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Votos Nulos</label>
                                        <Input type="number" className="font-bold border-white/10 bg-white/5 h-10 text-destructive" value={electionData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-white/5">
                                    {electionData.unionVotes.map(uv => (
                                        <div key={uv.union} className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-gray-200 truncate">{uv.union}</span>
                                            <Input type="number" className="w-20 h-9 text-right text-xs font-bold border-white/10 bg-white/5 focus:border-primary/50" value={uv.votes} onChange={(e) => handleVoteChange(uv.union, e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button className="flex-1 h-11" onClick={handleSave}>
                                        <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                                    </Button>
                                    <Button variant="outline" onClick={handleReset} className="border-white/10 hover:bg-white/5 h-11 px-4" title="Borrar todo">
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* TABLA DE RESULTADOS (VISIBLE EN WEB E INFORME) */}
                    <Card className="lg:col-span-1 border-white/10 shadow-xl bg-card">
                        <CardHeader className="border-b border-white/5 pb-4 print:pb-2 bg-white/5 print:bg-transparent">
                            <CardTitle className="text-base font-black text-white print:text-black flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Resultados por Candidatura
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <table className="w-full text-xs table-compact">
                                <thead>
                                    <tr className="border-b-2 border-white/5 print:border-slate-200 text-[10px] uppercase text-gray-500 font-black">
                                        <th className="py-2 text-left">Siglas</th>
                                        <th className="py-2 text-right">Votos</th>
                                        <th className="py-2 text-right">% Válido</th>
                                        <th className="py-2 text-right text-primary print:text-blue-700">Delegados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 print:divide-slate-50">
                                    {results.sort((a,b) => b.finalSeats - a.finalSeats || b.votes - a.votes).map(r => (
                                        <tr key={r.union} className={`${r.excluded ? 'opacity-30' : 'hover:bg-white/5'} transition-colors`}>
                                            <td className="py-3 font-bold text-gray-200 print:text-black">{r.union}</td>
                                            <td className="py-3 text-right font-medium">{r.votes}</td>
                                            <td className="py-3 text-right text-gray-500">{r.percentage.toFixed(1)}%</td>
                                            <td className="py-3 text-right font-black text-primary print:text-blue-700 text-sm">
                                                {r.finalSeats > 0 ? (
                                                    <span className="bg-primary/10 print:bg-blue-50 px-2 py-1 rounded">
                                                        {r.finalSeats}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-8 pt-4 border-t border-white/5 print:border-slate-200 space-y-2 text-[10px] font-bold text-gray-500">
                                <div className="flex justify-between items-center italic">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary" /> Votos a Candidaturas:</span>
                                    <span>{electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center italic">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-gray-400" /> Votos en Blanco:</span>
                                    <span>{electionData.blankVotes}</span>
                                </div>
                                <div className="flex justify-between items-center text-white print:text-black font-black border-t-2 border-primary/20 print:border-blue-100 pt-3 text-xs">
                                    <span>Base de cálculo (Votos Válidos):</span>
                                    <span className="text-primary">{electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                                </div>
                                {results.some(r => r.excluded) && (
                                    <div className="flex items-center gap-1.5 text-destructive mt-2 text-[9px] uppercase">
                                        <AlertTriangle className="w-3 h-3" />
                                        Existen candidaturas excluidas por no alcanzar el 5% de votos válidos.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* GRÁFICO DE DISTRIBUCIÓN (VISIBLE EN WEB E INFORME) */}
                    <Card className="lg:col-span-2 border-white/10 shadow-xl bg-card overflow-hidden print:mt-6">
                        <CardHeader className="bg-white/5 border-b border-white/5 py-4 print:bg-transparent print:pb-2">
                            <CardTitle className="text-base font-black text-white print:text-black">
                                Representación Visual de la Nueva Junta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex h-16 w-full rounded-xl border border-white/10 print:border-slate-300 overflow-hidden distribution-bar bg-white/5 shadow-inner">
                                {results.filter(r => r.finalSeats > 0).map((r, i) => (
                                    <div 
                                        key={r.union} 
                                        className="h-full flex flex-col items-center justify-center text-[11px] font-black border-r border-white/30 last:border-0"
                                        style={{ 
                                            backgroundColor: `hsl(${210 + (i * 18)}, 80%, 50%)`, 
                                            width: `${(r.finalSeats / electionData.totalSeats) * 100}%`,
                                            color: 'white'
                                        }}
                                    >
                                        <span className="truncate w-full text-center px-1 uppercase tracking-tighter">{r.union}</span>
                                        <span className="text-sm bg-black/20 px-1.5 rounded">{r.finalSeats}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] text-gray-500 no-print">
                                <div className="flex flex-col gap-1">
                                    <span className="uppercase font-black text-gray-400">Algoritmo</span>
                                    <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Restos Mayores</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="uppercase font-black text-gray-400">Barrera</span>
                                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 5% Proceso</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="uppercase font-black text-gray-400">Verificación</span>
                                    <div className="flex items-center gap-2 italic">HASH: VT-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="uppercase font-black text-gray-400">Documentación</span>
                                    <div className="flex items-center gap-2 font-bold text-white">Hoja 1 de 1</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PIE DE PÁGINA (SOLO IMPRESIÓN) */}
                <div className="print-only text-center text-[9pt] text-slate-400 border-t border-slate-200 pt-8 mt-12">
                    <div className="flex justify-between items-start text-left">
                        <div className="w-1/3 border-t border-slate-300 pt-2">
                            <p className="font-bold text-slate-800 uppercase text-[8px] mb-8">Firma Presidente de Mesa</p>
                        </div>
                        <div className="w-1/3 text-center">
                            <p className="font-bold text-slate-700 mb-1">Certificación electrónica de resultados provisionales.</p>
                            <p className="text-[8px]">Generado por VotoTrack PRO | ID: {Date.now().toString(16).toUpperCase()}</p>
                        </div>
                        <div className="w-1/3 border-t border-slate-300 pt-2 text-right">
                            <p className="font-bold text-slate-800 uppercase text-[8px] mb-8">Firma Secretario de Mesa</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectionResults;
