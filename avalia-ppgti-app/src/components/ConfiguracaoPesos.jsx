import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';

const API_URL = 'http://localhost:8080/api';

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
const getCurrentProcess = () => apiFetch(`${API_URL}/selection-processes/current`);
const getCurrentProcessWeights = () => apiFetch(`${API_URL}/selection-processes/current/weights`);
const updateCurrentProcessWeights = (weights) => {
    return apiFetch(`${API_URL}/selection-processes/current/weights`, {
        method: 'PUT',
        body: JSON.stringify(weights),
    });
};

// ====================================================================
// COMPONENTE REACT
// ====================================================================

function ConfiguracaoPesos() {
    const [processInfo, setProcessInfo] = useState(null);
    const [weights, setWeights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const processData = await getCurrentProcess();
            setProcessInfo(processData);
            const weightsData = await getCurrentProcessWeights();
            setWeights(weightsData);
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
        // Verifica se todos os pesos estão entre 0 e 1
        const hasInvalidWeight = weights.some(w => w.stageWeight < 0 || w.stageWeight > 1);
        if (hasInvalidWeight) {
            alert('Todos os pesos devem estar entre 0 e 1.');
            return;
        }

        // Verifica se a soma dos pesos é exatamente 1
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
            <h1 className="mb-4">Configuração de Pesos</h1>

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