
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { UNIONS, calculateElectionResults } from '../lib/electionUtils';
import { ElectionData, Voter } from '../types';
import { BarChart3, PieChart, Info, Save, RotateCcw, CheckCircle2, AlertTriangle, Printer, FileDown, Table as TableIcon } from 'lucide-react';
import { Badge } from './ui/Badge';

interface ElectionResultsProps {
    voters: Voter[];
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ voters }) => {
    const [electionData, setElectionData] = useState<ElectionData>(() => {
        const saved = localStorage.getItem('voto-track-election-results');
        return saved ? JSON.parse(saved) : {
            blankVotes: 0,
            nullVotes: 0,
            unionVotes: UNIONS.map(u => ({ union: u, votes: 0 }))
        };
    });

    const results = useMemo(() => calculateElectionResults(electionData), [electionData]);
    
    const totalVoters = voters.length;
    const votesInBox = electionData.blankVotes + electionData.nullVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0);
    const participationRate = totalVoters > 0 ? (votesInBox / totalVoters) * 100 : 0;

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
        // Forzamos el foco y un pequeño delay para asegurar que el navegador responda
        window.focus();
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleExportCSV = () => {
        const headers = ["Sindicato", "Votos", "Porcentaje", "Excluido 5%", "Delegados"];
        const rows = results.map(r => [
            r.union,
            r.votes,
            `${r.percentage.toFixed(2)}%`,
            r.excluded ? "SÍ" : "NO",
            r.finalSeats
        ]);

        // Añadir totales al CSV
        rows.push([]);
        rows.push(["TOTAL VOTOS EMITIDOS", votesInBox, "", "", ""]);
        rows.push(["VOTOS EN BLANCO", electionData.blankVotes, "", "", ""]);
        rows.push(["VOTOS NULOS", electionData.nullVotes, "", "", ""]);
        rows.push(["TOTAL DELEGADOS", "", "", "", "35"]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers, ...rows].map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `resultados_elecciones_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Estilos específicos para impresión */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .card { border: 1px solid #eee !important; box-shadow: none !important; background: white !important; break-inside: avoid; }
                    .text-gray-400 { color: #666 !important; }
                    .bg-primary\\/10 { background-color: #f0f7ff !important; border: 1px solid #cce3ff !important; }
                    .bg-accent\\/10 { background-color: #f0fdf4 !important; border: 1px solid #dcfce7 !important; }
                    .bg-white\\/5 { background-color: #f9fafb !important; border: 1px solid #e5e7eb !important; }
                    .grid { display: block !important; }
                    .grid > div { margin-bottom: 20px !important; width: 100% !important; }
                    .print-header { display: block !important; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
                    .print-grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
                    @page { margin: 1.5cm; }
                }
                .print-header { display: none; }
            `}} />

            {/* Cabecera para Impresión */}
            <div className="print-header text-center">
                <h1 className="text-3xl font-bold text-blue-800">VotoTrack - Informe de Resultados</h1>
                <p className="text-gray-600">Escrutinio Provisional de Elecciones Sindicales</p>
                <p className="text-sm mt-2">Fecha de emisión: {new Date().toLocaleString('es-ES')}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <h2 className="text-xl font-semibold">Resumen de Escrutinio</h2>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Descargar CSV (Excel)
                    </Button>
                    <Button variant="default" size="sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir / PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-grid-2">
                <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-primary p-2 rounded-lg no-print"><BarChart3 className="text-white" /></div>
                        <div>
                            <p className="text-xs text-gray-400">Votos en Urna</p>
                            <p className="text-xl font-bold">{votesInBox}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-accent/10 border-accent/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-accent p-2 rounded-lg no-print"><PieChart className="text-white" /></div>
                        <div>
                            <p className="text-xs text-gray-400">Participación</p>
                            <p className="text-xl font-bold">{participationRate.toFixed(2)}%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-gray-500 p-2 rounded-lg no-print"><CheckCircle2 className="text-white" /></div>
                        <div>
                            <p className="text-xs text-gray-400">Delegados Totales</p>
                            <p className="text-xl font-bold">35</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel de Entrada de Datos - Oculto en impresión */}
                <Card className="no-print">
                    <CardHeader>
                        <CardTitle>Entrada de Escrutinio</CardTitle>
                        <CardDescription>Introduce los votos obtenidos por cada lista</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Votos en Blanco</label>
                                <Input type="number" value={electionData.blankVotes} onChange={(e) => handleVoteChange(null, e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Votos Nulos</label>
                                <Input type="number" value={electionData.nullVotes} onChange={(e) => handleVoteChange('null', e.target.value)} />
                            </div>
                        </div>
                        
                        <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            {electionData.unionVotes.map(uv => (
                                <div key={uv.union} className="flex items-center justify-between gap-4">
                                    <label className="text-sm font-semibold truncate w-32">{uv.union}</label>
                                    <Input 
                                        type="number" 
                                        className="w-24 text-right"
                                        value={uv.votes} 
                                        onChange={(e) => handleVoteChange(uv.union, e.target.value)} 
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button className="flex-1" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Guardar</Button>
                            <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Panel de Resultados - Siempre visible y expandido en impresión */}
                <Card className="flex flex-col lg:col-span-1 print:w-full">
                    <CardHeader>
                        <CardTitle>Reparto de Delegados Final</CardTitle>
                        <CardDescription className="no-print">Cálculo proporcional (Restos Mayores) con barrera del 5%</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
                                <tr>
                                    <th className="py-2 text-left">Sindicato</th>
                                    <th className="py-2 text-right">Votos</th>
                                    <th className="py-2 text-right">% Válido</th>
                                    <th className="py-2 text-right">Delegados</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {results.sort((a,b) => b.finalSeats - a.finalSeats || b.votes - a.votes).map(r => (
                                    <tr key={r.union} className={r.excluded ? 'opacity-40 grayscale print:opacity-30' : ''}>
                                        <td className="py-3 flex items-center gap-2">
                                            <span className="font-semibold">{r.union}</span>
                                            {r.excluded && r.votes > 0 && (
                                                <Badge variant="destructive" className="text-[10px] py-0 px-1 no-print">Excluido 5%</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">{r.votes}</td>
                                        <td className="py-3 text-right">{r.percentage.toFixed(1)}%</td>
                                        <td className="py-3 text-right">
                                            <span className={`text-lg font-bold ${r.finalSeats > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {r.finalSeats}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="mt-6 space-y-1 text-xs text-gray-500 border-t border-gray-100 pt-4">
                            <div className="flex justify-between">
                                <span>Total Votos a Candidaturas:</span>
                                <span>{electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Votos en Blanco:</span>
                                <span>{electionData.blankVotes}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-700">
                                <span>Total Votos Válidos:</span>
                                <span>{electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</span>
                            </div>
                        </div>

                        {votesInBox === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 no-print">
                                <Info className="w-8 h-8 mb-2" />
                                <p>Introduce votos para generar el informe</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico Visual de Representación */}
            <Card className="print:mt-8">
                <CardHeader className="no-print">
                    <CardTitle>Visualización de la Junta de Personal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-16 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        {results.filter(r => r.finalSeats > 0).map((r, i) => (
                            <div 
                                key={r.union} 
                                className="h-full flex flex-col items-center justify-center text-[10px] font-bold border-r border-white last:border-0 hover:brightness-110 transition-all cursor-default opacity-${100 - (i * 10)}"
                                style={{ 
                                    backgroundColor: `hsl(${217 - (i * 15)}, 80%, 60%)`, 
                                    width: `${(r.finalSeats / 35) * 100}%`,
                                    color: 'white'
                                }}
                                title={`${r.union}: ${r.finalSeats} delegados`}
                            >
                                <span className="truncate w-full text-center px-1">{r.union}</span>
                                <span className="text-xs">{r.finalSeats}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500 no-print">
                        <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-500" /> Votos Válidos: {electionData.blankVotes + electionData.unionVotes.reduce((acc, v) => acc + v.votes, 0)}</div>
                        <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> Barrera electoral aplicada del 5%</div>
                    </div>
                    <div className="hidden print:block mt-4 text-[10px] text-center text-gray-400">
                        Informe generado automáticamente por VotoTrack - Sistema de Gestión Electoral Proporcional
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ElectionResults;
