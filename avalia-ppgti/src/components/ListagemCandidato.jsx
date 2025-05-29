import React, { useEffect, useState } from 'react';
import { Card, Button, Dropdown, ListGroup, Alert } from 'react-bootstrap';
import { API_ENDPOINTS } from '../config'; 

const ListagemCandidato = ({ onSelectCandidate, onViewCandidadeInfo }) => {
    const [selectedTheme, setSelectedTheme] = useState('All');
    const [selectedTopicId, setSelectedTopicId] = useState('All');
    const [topics, setTopics] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(API_ENDPOINTS.RESEARCH_TOPICS)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar os temas');
                return response.json();
            })
            .then(data => setTopics(data))
            .catch(err => setError(err.message));
    }, []);

    useEffect(() => {
        const fetchAllCandidates = async () => {
            setLoading(true);
            setError(null);
            let allCandidatos = [];
            try {
                const results = await Promise.all(topics.map(topic => 
                    fetch(API_ENDPOINTS.HOMOLOGATED_CANDIDATES_BY_TOPIC(topic.id))
                        .then(res => res.status === 204 ? [] : res.json().then(data => data.map(c => ({ ...c, topicName: topic.name }))))
                        .catch(() => [])
                ));
                results.forEach(candList => {
                    if (Array.isArray(candList)) allCandidatos = [...allCandidatos, ...candList];
                });
                setCandidatos(allCandidatos);
            } catch (err) {
                setError('Erro ao carregar os candidatos');
            } finally {
                setLoading(false);
                if (typeof onSelectCandidate === 'function') onSelectCandidate(null);
                if (typeof onViewCandidadeInfo === 'function') onViewCandidadeInfo(false);
            }
        };

        const fetchByTopic = () => {
            setLoading(true);
                fetch(API_ENDPOINTS.HOMOLOGATED_CANDIDATES_BY_TOPIC(selectedTopicId))
                .then(response => {
                    if (response.status === 204) return [];
                    if (!response.ok) throw new Error('Erro ao carregar os candidatos');
                    return response.json();
                })
                .then(data => {
                    const topic = topics.find(t => t.id === selectedTopicId);
                    const topicName = topic ? topic.name : 'Tema desconhecido';
                    const candidatosComTema = (data || []).map(c => ({ ...c, topicName }));
                    setCandidatos(candidatosComTema);
                    setError(null);
                })
                .catch(error => {
                    setCandidatos([]);
                    setError(error.message);
                })
                .finally(() => {
                    setLoading(false);
                    if (typeof onSelectCandidate === 'function') onSelectCandidate(null);
                    if (typeof onViewCandidadeInfo === 'function') onViewCandidadeInfo(false);
                });
        };

        if (selectedTopicId === 'All') {
            if (topics.length > 0) {
                fetchAllCandidates();
            }
        } else {
            fetchByTopic();
        }
    }, [selectedTopicId, topics, onSelectCandidate, onViewCandidadeInfo]);

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Candidatos</h5>
                <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-themes" style={{ width: "400px", alignItems: "center", overflow: "hidden" }}>
                        {selectedTheme === 'All' ? 'Todos os Temas' : selectedTheme}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {
                            setSelectedTheme('All');
                            setSelectedTopicId('All');
                        }}>Todos os Temas</Dropdown.Item>
                        {topics.map((topic) => (
                            <Dropdown.Item
                                key={topic.id}
                                onClick={() => {
                                    setSelectedTheme(topic.name);
                                    setSelectedTopicId(topic.id);
                                }}
                            >
                                {topic.name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Card.Header>
            <Card.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {loading ? (
                    <Alert variant="secondary" className="text-center">Carregando...</Alert>
                ) : error ? (
                    <Alert variant="danger" className="text-center">{error}</Alert>
                ) : candidatos.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        Nenhum candidato encontrado para este tema.
                    </Alert>
                ) : (
                    <ListGroup>
                        {candidatos.map((candidate, index) => (
                            <ListGroup.Item key={index} className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{candidate.name || candidate.nome}</strong>
                                    </div>
                                    <div>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {
                                                onViewCandidadeInfo(true);
                                                onSelectCandidate(candidate);
                                            }}>
                                            Detalhes
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                onViewCandidadeInfo(false);
                                                onSelectCandidate(candidate);
                                            }}
                                        >
                                            Avaliar
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-1 text-muted small">
                                    {candidate.topicName || 'Tema não informado'}
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default ListagemCandidato;