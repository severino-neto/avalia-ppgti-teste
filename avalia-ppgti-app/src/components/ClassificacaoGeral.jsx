import React, { useEffect, useState } from 'react';
import { Table, Button, Accordion, Spinner, Alert } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { API_ENDPOINTS } from '../config';

const STAGE_IDS = {
    curriculo: 1,
    preProjeto: 2,
    entrevista: 3,
};

const fetchStageData = async (processId, stageId) => {
    try {
        const response = await fetch(API_ENDPOINTS.RANKING_BY_STAGE(processId, stageId));
        if (!response.ok) throw new Error('Falha ao buscar dados da API.');
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar dados da etapa ${stageId}:`, error);
        throw error;
    }
};

const fetchAndMergeRankingData = async (processId) => {
    try {
        const [finalScoreRes, curriculoData, preProjetoData, entrevistaData] = await Promise.all([
            fetch(API_ENDPOINTS.GET_RANKING(processId)),
            fetchStageData(processId, STAGE_IDS.curriculo),
            fetchStageData(processId, STAGE_IDS.preProjeto),
            fetchStageData(processId, STAGE_IDS.entrevista),
        ]);

        if (!finalScoreRes.ok) throw new Error('Falha ao buscar dados finais da API.');
        const finalScoreData = await finalScoreRes.json();

        const mergedData = new Map();

        const addToMap = (data, scoreField) => {
            if (!data) return;
            data.forEach(item => {
                const key = `${item.researchLineId}-${item.researchTopicId}-${item.candidateId}`;
                const existing = mergedData.get(key) || {
                    ...item,
                    status: 'Aprovado',
                    scores: {},
                };

                if (item.isEliminatedInStage) {
                    existing.status = 'Reprovado';
                }

                existing.scores[scoreField] = item.totalStageScore;
                mergedData.set(key, existing);
            });
        };

        addToMap(curriculoData, 'curriculo');
        addToMap(preProjetoData, 'preProjeto');
        addToMap(entrevistaData, 'entrevista');

        finalScoreData.forEach(item => {
            const key = `${item.researchLineId}-${item.researchTopicId}-${item.candidateId}`;
            const candidate = mergedData.get(key);
            if (candidate) {
                candidate.finalScore = item.finalScore;
            }
        });

        return Array.from(mergedData.values());
    } catch (error) {
        console.error("Erro na lógica de fetch e merge:", error);
        throw error;
    }
};


const processAndGroupData = (apiData) => {
    // Primeiro agrupa por researchLineId, depois por researchTopicId
    const grouped = apiData.reduce((acc, candidate) => {
        const { researchLineId, researchLineName, researchTopicId, researchTopicName } = candidate;

        if (!acc[researchLineId]) {
            acc[researchLineId] = {
                name: researchLineName,
                topics: {}
            };
        }

        if (!acc[researchLineId].topics[researchTopicId]) {
            acc[researchLineId].topics[researchTopicId] = {
                name: researchTopicName,
                candidates: []
            };
        }

        acc[researchLineId].topics[researchTopicId].candidates.push(candidate);
        return acc;
    }, {});

    // Ordena os candidatos dentro de cada tópico por nota final
    Object.values(grouped).forEach(line => {
        Object.values(line.topics).forEach(topic => {
            topic.candidates.sort((a, b) => b.finalScore - a.finalScore);
            topic.candidates.forEach((candidate, index) => {
                candidate.position = index + 1;
            });
        });
    });

    return grouped;
};

const ClassificacaoGeral = ({ processId = 1 }) => {
    const [groupedData, setGroupedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topicVacancies, setTopicVacancies] = useState({});

    useEffect(() => {
        const fetchVacancies = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/research-topics/by-process/${processId}`);
                const data = await res.json();

                const vacanciesMap = {};
                data.forEach(topic => {
                    vacanciesMap[topic.id] = topic.vacancies;
                });

                setTopicVacancies(vacanciesMap);
            } catch (err) {
                console.error('Erro ao buscar vagas por tema:', err);
            }
        };

        fetchVacancies();
    }, []);

    const handleUpdateRanking = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ENDPOINTS.GENERATE_RANKING(processId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });


            if (!response.ok) {
                throw new Error('Falha ao atualizar o ranking');
            }

            // Recarrega os dados após a atualização
            const apiData = await fetchAndMergeRankingData(processId);
            const processed = processAndGroupData(apiData);
            setGroupedData(processed);

            alert('Ranking atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar ranking:', error);
            alert(`Erro ao atualizar ranking: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const apiData = await fetchAndMergeRankingData(processId);

                if (apiData && apiData.length > 0) {
                    const processed = processAndGroupData(apiData);
                    setGroupedData(processed);
                } else {
                    setGroupedData({});
                }
            } catch (err) {
                setError("Não foi possível carregar a classificação. Verifique a conexão com a API e se ela está em execução.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [processId]);

    if (loading) {
        return <div className="d-flex justify-content-center my-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (!groupedData || Object.keys(groupedData).length === 0) {
        return <Alert variant="info">Nenhum dado de classificação encontrado para este processo.</Alert>;
    }

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        const allCandidates = [];

        Object.entries(groupedData).forEach(([lineId, lineData]) => {
            Object.entries(lineData.topics).forEach(([topicId, topicData]) => {
                topicData.candidates.forEach(c => {
                    allCandidates.push({
                        'Linha de Pesquisa': lineData.name,
                        'Tema de Pesquisa': topicData.name,
                        Posição: c.position,
                        Nome: c.candidateName,
                        Cota: c.quotaName ? 'Sim' : 'Não',
                        'Pré-Projeto': c.scores?.preProjeto?.toFixed(2) ?? 'N/A',
                        Entrevista: c.scores?.entrevista?.toFixed(2) ?? 'N/A',
                        Currículo: c.scores?.curriculo?.toFixed(2) ?? 'N/A',
                        'Nota Final': c.finalScore?.toFixed(2) ?? 'N/A',
                        Status: c.status,
                    });
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(allCandidates);
        XLSX.utils.book_append_sheet(wb, worksheet, 'Classificação Geral');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        const s2ab = (s) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        };

        saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'classificacao-geral.xlsx');
    };


    const exportToPDF = () => {
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(16);
        doc.text('Classificação Geral do Processo Seletivo', 10, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.text(`Data de geração: ${new Date().toLocaleDateString()}`, 10, yPos);
        yPos += 10;

        if (!groupedData || Object.keys(groupedData).length === 0) {
            doc.text('Nenhum dado disponível para exportação', 10, yPos);
            doc.save('classificacao-geral.pdf');
            return;
        }

        Object.entries(groupedData).forEach(([lineId, lineData]) => {
            // Verifica se precisa de nova página
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Linha de Pesquisa
            doc.setFontSize(14);
            doc.text(`Linha de Pesquisa ${lineId}: ${lineData.name}`, 10, yPos);
            yPos += 10;

            Object.entries(lineData.topics).forEach(([topicId, topicData]) => {
                const vagas = topicVacancies[topicId] ?? 0;
                const aprovados = topicData.candidates.filter(c => c.status === 'Aprovado');
                const classificados = aprovados.slice(0, vagas);
                const listaEspera = aprovados.slice(vagas);
                const reprovados = topicData.candidates.filter(c => c.status === 'Reprovado');

                // Tema de Pesquisa
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(12);
                doc.text(`Tema ${topicId}: ${topicData.name} (Vagas: ${vagas})`, 10, yPos);
                yPos += 8;

                // Seção de Aprovados
                if (classificados.length > 0) {
                    if (yPos > 230) {
                        doc.addPage();
                        yPos = 20;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(0, 100, 0);
                    doc.text('Aprovados:', 10, yPos);
                    yPos += 6;

                    const approvedData = classificados.map(c => [
                        `${c.position}º`,
                        c.candidateName,
                        c.quotaName ? 'Sim' : 'Não',
                        c.scores.preProjeto?.toFixed(2) ?? 'N/A',
                        c.scores.entrevista?.toFixed(2) ?? 'N/A',
                        c.scores.curriculo?.toFixed(2) ?? 'N/A',
                        c.finalScore?.toFixed(2) ?? 'N/A'
                    ]);

                    autoTable(doc, {
                        startY: yPos,
                        head: [['Posição', 'Nome', 'Cota', 'Pré-Projeto', 'Entrevista', 'Currículo', 'Nota Final']],
                        body: approvedData,
                        margin: { top: 5 },
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [34, 139, 34] }
                    });

                    yPos = doc.lastAutoTable.finalY + 5;
                }

                // Seção de Lista de Espera
                if (listaEspera.length > 0) {
                    if (yPos > 230) {
                        doc.addPage();
                        yPos = 20;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(210, 140, 0);
                    doc.text('Lista de Espera:', 10, yPos);
                    yPos += 6;

                    const waitingListData = listaEspera.map(c => [
                        `${c.position}º`,
                        c.candidateName,
                        c.quotaName ? 'Sim' : 'Não',
                        c.scores.preProjeto?.toFixed(2) ?? 'N/A',
                        c.scores.entrevista?.toFixed(2) ?? 'N/A',
                        c.scores.curriculo?.toFixed(2) ?? 'N/A',
                        c.finalScore?.toFixed(2) ?? 'N/A'
                    ]);

                    autoTable(doc, {
                        startY: yPos,
                        head: [['Posição', 'Nome', 'Cota', 'Pré-Projeto', 'Entrevista', 'Currículo', 'Nota Final']],
                        body: waitingListData,
                        margin: { top: 5 },
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [210, 140, 0] }
                    });

                    yPos = doc.lastAutoTable.finalY + 5;
                }

                // Seção de Reprovados
                if (reprovados.length > 0) {
                    if (yPos > 230) {
                        doc.addPage();
                        yPos = 20;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(220, 0, 0);
                    doc.text('Reprovados:', 10, yPos);
                    yPos += 6;

                    const rejectedData = reprovados.map(c => [
                        `${c.position}º`,
                        c.candidateName,
                        c.quotaName ? 'Sim' : 'Não',
                        c.scores.preProjeto?.toFixed(2) ?? 'N/A',
                        c.scores.entrevista?.toFixed(2) ?? 'N/A',
                        c.scores.curriculo?.toFixed(2) ?? 'N/A',
                        c.finalScore?.toFixed(2) ?? 'N/A',
                        'Reprovado na etapa'
                    ]);

                    autoTable(doc, {
                        startY: yPos,
                        head: [['Posição', 'Nome', 'Cota', 'Pré-Projeto', 'Entrevista', 'Currículo', 'Nota Final', 'Motivo']],
                        body: rejectedData,
                        margin: { top: 5 },
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [220, 0, 0] }
                    });

                    yPos = doc.lastAutoTable.finalY + 10;
                }

                // Reset text color
                doc.setTextColor(0, 0, 0);
            });
        });

        doc.save('classificacao-geral.pdf');
    };

    return (
        <div className="container mt-4">
            <h2>Classificação Geral</h2>
            <p className="text-muted">Resultado final do processo seletivo, agrupado por linha e tema de pesquisa.</p>
            <Button
                variant="primary"
                onClick={handleUpdateRanking}
                disabled={loading}
            >
                {loading ? 'Atualizando...' : 'Atualizar Ranking'}
            </Button>

            <Button variant="success" onClick={exportToExcel} className="ms-2">
                Exportar Excel
            </Button>

            <Button variant="success" onClick={exportToPDF} className="ms-2">
                Exportar PDF
            </Button>



            {Object.entries(groupedData).map(([lineId, lineData]) => (
                <div key={lineId} className="mb-5">
                    <h3 className="mb-3">Linha de Pesquisa {lineId}: {lineData.name}</h3>

                    {Object.entries(lineData.topics).map(([topicId, topicData]) => {

                        const aprovados = topicData.candidates.filter(c => c.status === 'Aprovado');
                        const reprovados = topicData.candidates.filter(c => c.status === 'Reprovado');

                        // Número de vagas do tema atual
                        const vagas = topicVacancies[topicId] ?? 0;

                        // Aprovados dentro das vagas
                        const classificados = aprovados.slice(0, vagas);

                        // Aprovados excedentes (lista de espera)
                        const listaEspera = aprovados.slice(vagas);


                        return (
                            <div key={topicId} className="mb-4">
                                <h4>Tema {topicId}: {topicData.name}</h4>

                                {classificados.length > 0 && (
                                    <>
                                        <h5 className="mt-3 text-success">Aprovados</h5>
                                        <Table striped bordered hover responsive="sm" size="sm" className="mb-4">
                                            <thead>
                                                <tr>
                                                    <th>Posição</th>
                                                    <th>Nome do Candidato</th>
                                                    <th>Cota</th>
                                                    <th>Pré-Projeto</th>
                                                    <th>Entrevista</th>
                                                    <th>Currículo</th>
                                                    <th>Nota Final</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {classificados.map(candidate => (
                                                    <tr key={`classificado-${candidate.candidateId}`}>
                                                        <td><strong>{candidate.position}º</strong></td>
                                                        <td>{candidate.candidateName}</td>
                                                        <td>{candidate.quotaName ? 'Sim' : 'Não'}</td>
                                                        <td>{candidate.scores.preProjeto?.toFixed(2) ?? 'N/A'}</td>
                                                        <td>{candidate.scores.entrevista?.toFixed(2) ?? 'N/A'}</td>
                                                        <td>{candidate.scores.curriculo?.toFixed(2) ?? 'N/A'}</td>
                                                        <td><strong>{candidate.finalScore?.toFixed(2) ?? 'N/A'}</strong></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </>
                                )}

                                {listaEspera.length > 0 && (
                                    <>
                                        <h5 className="mt-3 text-warning">Lista de Espera</h5>
                                        <Table striped bordered hover responsive="sm" size="sm" className="mb-4">
                                            <thead>
                                                <tr>
                                                    <th>Posição</th>
                                                    <th>Nome do Candidato</th>
                                                    <th>Cota</th>
                                                    <th>Pré-Projeto</th>
                                                    <th>Entrevista</th>
                                                    <th>Currículo</th>
                                                    <th>Nota Final</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listaEspera.map(candidate => (
                                                    <tr key={`espera-${candidate.candidateId}`}>
                                                        <td><strong>{candidate.position}º</strong></td>
                                                        <td>{candidate.candidateName}</td>
                                                        <td>{candidate.quotaName ? 'Sim' : 'Não'}</td>
                                                        <td>{candidate.scores.preProjeto?.toFixed(2) ?? 'N/A'}</td>
                                                        <td>{candidate.scores.entrevista?.toFixed(2) ?? 'N/A'}</td>
                                                        <td>{candidate.scores.curriculo?.toFixed(2) ?? 'N/A'}</td>
                                                        <td><strong>{candidate.finalScore?.toFixed(2) ?? 'N/A'}</strong></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </>
                                )}


                                {reprovados.length > 0 && (
                                    <>
                                        <h5 className="mt-3 text-danger">Reprovados</h5>
                                        <Table striped bordered hover responsive="sm" size="sm" className="mb-4">
                                            <thead>
                                                <tr>
                                                    <th>Posição</th>
                                                    <th>Nome do Candidato</th>
                                                    <th>Cota</th>
                                                    <th>Pré-Projeto</th>
                                                    <th>Entrevista</th>
                                                    <th>Currículo</th>
                                                    <th>Nota Final</th>
                                                    <th>Motivo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reprovados.map(candidate => (
                                                    <tr key={`reprovado-${candidate.candidateId}`}>
                                                        <td><strong>{candidate.position}º</strong></td>
                                                        <td>{candidate.candidateName}</td>
                                                        <td>{candidate.quotaName ? 'Sim' : 'Não'}</td>
                                                        <td>{candidate.scores.preProjeto?.toFixed(2) ?? 'N/A'}</td>
                                                        <td>{candidate.scores.entrevista?.toFixed(2) ?? 'N/A'}</td>
                                                        <td>{candidate.scores.curriculo?.toFixed(2) ?? 'N/A'}</td>
                                                        <td><strong>{candidate.finalScore?.toFixed(2) ?? 'N/A'}</strong></td>
                                                        <td>Reprovado na etapa</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default ClassificacaoGeral;