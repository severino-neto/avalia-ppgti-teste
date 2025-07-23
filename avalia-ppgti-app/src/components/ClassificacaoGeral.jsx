import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_ENDPOINTS } from '../config';

const ClassificacaoGeral = ({ processId = 1 }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.RANKING_GERAL(processId), {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Erro ao buscar ranking geral');
            const json = await res.json();
            const sorted = json.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
            setData(sorted);
        } catch (error) {
            console.error('Erro ao carregar ranking geral:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [processId]);

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Classificação Geral', 10, 20);

        const tableData = data.map((item, index) => [
            index + 1,
            item.candidateName,
            item.quotaName ? 'Sim' : 'Não',
            `${item.researchLineName} / ${item.researchTopicName}`,
            item.finalScore != null ? item.finalScore : '-',
            item.applicationStatus
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['Posição', 'Candidato', 'Cota', 'Linha/Tema', 'Nota Final', 'Status']],
            body: tableData,
            styles: { overflow: 'linebreak', cellWidth: 'wrap' },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15 },
                3: { cellWidth: 60 },
                4: { cellWidth: 20 },
                5: { cellWidth: 30 },
            }
        });

        doc.save('classificacao_geral.pdf');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Classificação Geral</h2>
                <Button variant="success" onClick={exportToPDF}>Exportar PDF</Button>
            </div>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" size="sm" /> Carregando classificação...
                </div>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Nome do Candidato</th>
                            <th>Optante por Cota</th>
                            <th>Linha/Tema</th>
                            <th>Nota Final</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.candidateId}>
                                <td>{index + 1}</td>
                                <td>{item.candidateName}</td>
                                <td>{item.quotaName ? 'Sim' : 'Não'}</td>
                                <td>{`${item.researchLineName} / ${item.researchTopicName}`}</td>
                                <td>{item.finalScore != null ? item.finalScore : '-'}</td>
                                <td>{item.applicationStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default ClassificacaoGeral;
