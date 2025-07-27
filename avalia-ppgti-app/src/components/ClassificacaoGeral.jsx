import React, { useEffect, useState } from 'react';
import { Table, Button,  Accordion, Spinner, Alert  } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_ENDPOINTS } from '../config';


// ===================================================================================
// LÓGICA DE CHAMADA E PROCESSAMENTO DA API
// Em uma aplicação maior, é recomendado separar esta lógica em um arquivo próprio.
// ===================================================================================

// Endereço base da sua API. Altere para o endereço do seu backend.
const API_BASE_URL = 'http://localhost:8080/api/ranking'; 

// Mapeia os nomes das etapas para os IDs definidos no seu backend
const STAGE_IDS = {
    curriculo: 1,
    preProjeto: 2,
    entrevista: 3,
};

/**
 * Busca os dados de MÚLTIPLAS etapas e os junta em um único objeto por candidato.
 * Esta é uma solução alternativa para quando o backend não tem um endpoint consolidado.
 */
const fetchAndMergeRankingData = async (processId) => {
    try {
        // 1. Fazer todas as chamadas à API em paralelo para ganhar tempo
        const [curriculoRes, preProjetoRes, entrevistaRes] = await Promise.all([
            fetch(`${API_BASE_URL}/process/${processId}/stage/${STAGE_IDS.curriculo}`),
            fetch(`${API_BASE_URL}/process/${processId}/stage/${STAGE_IDS.preProjeto}`),
            fetch(`${API_BASE_URL}/process/${processId}/stage/${STAGE_IDS.entrevista}`),
        ]);

        if (!curriculoRes.ok || !preProjetoRes.ok || !entrevistaRes.ok) {
            throw new Error('Falha ao buscar os dados de uma ou mais etapas da API.');
        }

        const curriculoData = await curriculoRes.json();
        const preProjetoData = await preProjetoRes.json();
        const entrevistaData = await entrevistaRes.json();

        // 2. Juntar (Merge) os resultados usando um Map para garantir a unicidade do candidato
        const mergedData = new Map();

        const addToMap = (data, scoreField) => {
            if (!data) return;
            data.forEach(item => {
                const existing = mergedData.get(item.candidateName) || {
                    candidateName: item.candidateName,
                    quotaApplicant: item.quotaName ? true : false,
                    researchLineName: item.researchLineName,
                    researchThemeName: item.researchTopicName,
                    status: item.isEliminatedInStage ? 'Reprovado' : 'Aprovado',
                    scores: {},
                };
                
                existing.scores[scoreField] = item.totalStageScore;
                mergedData.set(item.candidateName, existing);
            });
        };

        addToMap(curriculoData, 'curriculo');
        addToMap(preProjetoData, 'preProjeto');
        addToMap(entrevistaData, 'entrevista');
        
        // 3. Calcular a nota final e converter o Map para um Array
        const finalResult = Array.from(mergedData.values()).map(candidate => {
            const { curriculo = 0, preProjeto = 0, entrevista = 0 } = candidate.scores;
            
            // ATENÇÃO: Ajuste a fórmula de cálculo da nota final conforme sua regra de negócio.
            // Aqui, estou usando uma média simples como exemplo.
            const finalScore = (curriculo + preProjeto + entrevista) / 3;

            return { ...candidate, finalScore };
        });

        return finalResult;

    } catch (error) {
        console.error("Erro na lógica de fetch e merge:", error);
        throw error; // Re-lança o erro para o componente tratar
    }
};

/**
 * Processa os dados já unificados para agrupar e calcular a posição.
 */
const processAndGroupData = (apiData) => {
    const grouped = apiData.reduce((acc, candidate) => {
        const { researchLineName, researchThemeName } = candidate;
        if (!acc[researchLineName]) acc[researchLineName] = {};
        if (!acc[researchLineName][researchThemeName]) acc[researchLineName][researchThemeName] = [];
        acc[researchLineName][researchThemeName].push(candidate);
        return acc;
    }, {});

    for (const line in grouped) {
        for (const theme in grouped[line]) {
            const sortedCandidates = grouped[line][theme].sort((a, b) => b.finalScore - a.finalScore);
            grouped[line][theme] = sortedCandidates.map((candidate, index) => ({
                ...candidate,
                position: index + 1,
            }));
        }
    }
    return grouped;
};

// ===================================================================================
// COMPONENTE REACT
// ===================================================================================

const ClassificacaoGeral = ({ processId = 1 }) => {
    const [groupedData, setGroupedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const apiData = await fetchAndMergeRankingData(processId); 
                
                if (apiData && apiData.length > 0) {
                    const processed = processAndGroupData(apiData);
                    setGroupedData(processed);
                } else {
                    setGroupedData({}); // Define como objeto vazio se não houver dados
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

    return (
        <div className="container mt-4">
            <h2>Classificação Geral</h2>
            <p className="text-muted">Resultado final do processo seletivo, agrupado por linha e tema de pesquisa.</p>

            <Accordion defaultActiveKey="0" alwaysOpen>
                {Object.keys(groupedData).map((lineName, lineIndex) => (
                    <Accordion.Item eventKey={lineIndex.toString()} key={lineName}>
                        <Accordion.Header>
                            <strong>Linha de Pesquisa: {lineName}</strong>
                        </Accordion.Header>
                        <Accordion.Body>
                            {Object.keys(groupedData[lineName]).map(themeName => (
                                <div key={themeName} className="mb-4">
                                    <h5>Tema: {themeName}</h5>
                                    <Table striped bordered hover responsive="sm" size="sm">
                                        <thead>
                                            <tr>
                                                <th>Posição</th>
                                                <th>Nome do Candidato</th>
                                                <th>Cota</th>
                                                <th>Pré-Projeto</th>
                                                <th>Entrevista</th>
                                                <th>Currículo</th>
                                                <th>Nota Final</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedData[lineName][themeName].map(candidate => (
                                                <tr key={candidate.candidateName}>
                                                    <td><strong>{candidate.position}º</strong></td>
                                                    <td>{candidate.candidateName}</td>
                                                    <td>{candidate.quotaApplicant ? 'Sim' : 'Não'}</td>
                                                    <td>{candidate.scores.preProjeto?.toFixed(2) ?? 'N/A'}</td>
                                                    <td>{candidate.scores.entrevista?.toFixed(2) ?? 'N/A'}</td>
                                                    <td>{candidate.scores.curriculo?.toFixed(2) ?? 'N/A'}</td>
                                                    <td><strong>{candidate.finalScore?.toFixed(2) ?? 'N/A'}</strong></td>
                                                    <td>{candidate.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ))}
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </div>
    );
};

export default ClassificacaoGeral;
