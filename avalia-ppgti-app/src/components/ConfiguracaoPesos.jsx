import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col, Table } from 'react-bootstrap';
import { API_ENDPOINTS } from '../config';

// Função auxiliar para obter o token de autenticação
const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.accessToken : null;
};

// Função genérica para chamadas à API
const apiFetch = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
    }
    return response.status !== 204 ? response.json() : response;
};

// Funções específicas para os endpoints
// In your api.js or service file
export const getCurrentProcess = () => apiFetch(API_ENDPOINTS.CURRENT_PROCESS);
export const getCurrentProcessWeights = () => apiFetch(API_ENDPOINTS.CURRENT_PROCESS_WEIGHTS);
export const getResearchTopics = (processId) => apiFetch(API_ENDPOINTS.RESEARCH_TOPICS_BY_PROCESS(processId));
export const updateCurrentProcessWeights = (weights) => apiFetch(API_ENDPOINTS.CURRENT_PROCESS_WEIGHTS, {
    method: 'PUT',
    body: JSON.stringify(weights)
});
export const updateResearchTopic = (id, researchTopic) => apiFetch(API_ENDPOINTS.UPDATE_RESEARCH_TOPIC(id), {
    method: 'PUT',
    body: JSON.stringify(researchTopic)
});

function ConfiguracaoPesos() {
    const [processInfo, setProcessInfo] = useState(null);
    const [weights, setWeights] = useState([]);
    const [researchTopics, setResearchTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [tempVacancies, setTempVacancies] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const processData = await getCurrentProcess();
            setProcessInfo(processData);

            const weightsData = await getCurrentProcessWeights();
            setWeights(weightsData);

            const topicsData = await getResearchTopics(processData.id); // Agora dinâmico
            setResearchTopics(topicsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleWeightChange = (stageId, newWeight) => {
        setWeights(prevWeights =>
            prevWeights.map(w =>
                w.stageId === stageId ? { ...w, stageWeight: parseFloat(newWeight) || 0 } : w
            )
        );
    };

    const handleSaveChanges = async () => {
        const hasInvalidWeight = weights.some(w => w.stageWeight < 0 || w.stageWeight > 1);
        if (hasInvalidWeight) {
            alert('Todos os pesos devem estar entre 0 e 1.');
            return;
        }

        const totalWeight = weights.reduce((sum, w) => sum + w.stageWeight, 0);
        if (Math.round(totalWeight * 100) / 100 !== 1.0) {
            alert('A soma de todos os pesos deve ser exatamente 1.0.');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const payload = weights.map(({ stageId, stageWeight }) => ({ stageId, stageWeight }));
            await updateCurrentProcessWeights(payload);
            alert('Pesos atualizados com sucesso!');
        } catch (err) {
            setError(err.message);
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (topic) => {
        setEditingId(topic.id);
        setTempVacancies(topic.vacancies);
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveVacancies = async (topic) => {
        try {
            setIsSaving(true);
            const updatedTopic = { ...topic, vacancies: tempVacancies };
            await updateResearchTopic(topic.id, updatedTopic);
            setResearchTopics(prev =>
                prev.map(t => t.id === topic.id ? updatedTopic : t)
            );
            setEditingId(null);
            alert('Vagas atualizadas com sucesso!');
        } catch (err) {
            setError(err.message);
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
            </Container>
        );
    }

    if (error && !processInfo) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">Erro ao carregar dados: {error}</Alert>
            </Container>
        );
    }

    const totalWeight = weights.reduce((sum, w) => sum + w.stageWeight, 0);

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Configurações de vagas e pesos do processo seletivo</h1>

            {processInfo && (
                <Card className="mb-4">
                    <Card.Header as="h5">Processo Seletivo Ativo</Card.Header>
                    <Card.Body>
                        <Card.Title>{processInfo.name}</Card.Title>
                        <Card.Text>
                            <strong>Período:</strong> {processInfo.year}.{processInfo.semester}<br />
                            <strong>Data de Início:</strong> {new Date(processInfo.startDate + 'T12:00:00').toLocaleDateString()}<br />
                            <strong>Data de Fim:</strong> {new Date(processInfo.endDate + 'T12:00:00').toLocaleDateString()}
                        </Card.Text>
                    </Card.Body>
                </Card>
            )}

            <Card className="mb-4">
                <Card.Header as="h5">Tópicos de Pesquisa e Vagas</Card.Header>
                <Card.Body>

                    <Table striped bordered hover className="mt-4">
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Vagas</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Agrupa por linha de pesquisa */}
                            {Object.entries(
                                researchTopics.reduce((acc, topic) => {
                                    const lineName = topic.researchLine.name;
                                    if (!acc[lineName]) {
                                        acc[lineName] = [];
                                    }
                                    acc[lineName].push(topic);
                                    return acc;
                                }, {})
                            )
                                .map(([lineName, topics]) => [
                                    // Cabeçalho da linha de pesquisa
                                    <tr key={`line-${lineName}`} className="bg-light">
                                        <td colSpan="3" className="fw-bold">
                                            {lineName}
                                        </td>
                                    </tr>,
                                    // Temas da linha
                                    ...topics
                                        .sort((a, b) => a.id - b.id)
                                        .map(topic => (
                                            <tr key={topic.id}>
                                                <td>
                                                    <strong>Tema {topic.id}:</strong> {topic.name}
                                                </td>
                                                <td>
                                                    {editingId === topic.id ? (
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            value={tempVacancies}
                                                            onChange={(e) => setTempVacancies(parseInt(e.target.value) || 0)}
                                                            style={{ width: '80px' }}
                                                        />
                                                    ) : (
                                                        topic.vacancies
                                                    )}
                                                </td>
                                                <td>
                                                    {editingId === topic.id ? (
                                                        <div className="d-flex flex-column align-items-center">
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => saveVacancies(topic)}
                                                                disabled={isSaving}
                                                                className="mb-2"
                                                            >
                                                                {isSaving ? 'Salvando...' : 'Salvar'}
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={cancelEditing}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => startEditing(topic)}
                                                        >
                                                            Editar
                                                        </Button>
                                                    )}
                                                </td>

                                            </tr>
                                        ))
                                ])}
                        </tbody>
                    </Table>

                </Card.Body>
            </Card>

            <Card>
                <Card.Header as="h5">Pesos das Etapas</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                        {weights.map(stage => (
                            <Form.Group as={Row} key={stage.stageId} className="mb-3 align-items-center">
                                <Form.Label column sm="8">
                                    {stage.stageName}
                                </Form.Label>
                                <Col sm="4">
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={stage.stageWeight}
                                        onChange={(e) => handleWeightChange(stage.stageId, e.target.value)}
                                    />
                                </Col>
                            </Form.Group>
                        ))}

                        <Card.Text className="mt-3">
                            <strong>Soma dos Pesos:</strong> {totalWeight.toFixed(2)}
                            <br />
                            <strong>Status:</strong>{' '}
                            {Math.abs(totalWeight - 1) < 0.001
                                ? '✅ Correta — a soma é 1.00'
                                : '❌ Incorreta — a soma deve ser 1.00'}
                        </Card.Text>
                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        {' '}Salvando...
                                    </>
                                ) : (
                                    'Salvar Pesos'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ConfiguracaoPesos;