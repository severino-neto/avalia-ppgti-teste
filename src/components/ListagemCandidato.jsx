import React, { useState } from 'react';
import { Card, Button, Dropdown, ListGroup, Alert } from 'react-bootstrap';
import candidatosData from './candidatos.json';

const ListagemCandidato = ({ candidatos, onSelectCandidate, onViewCandidadeInfo }) => {
    const [selectedTheme, setSelectedTheme] = useState('All');

    // Extract unique themes
    const themes = ['All', ...new Set(candidatosData.candidatos.map(c => c.tema))];

    // Filter candidates by selected theme
    const filteredCandidates = selectedTheme === 'All'
        ? candidatosData.candidatos
        : candidatosData.candidatos.filter(c => c.tema === selectedTheme);


    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Candidatos</h5>
                <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-themes" style={{ width: "400px", alignItems: "center", overflow: "hidden" }}>
                        {selectedTheme === 'All' ? 'Todos os Temas' : selectedTheme}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {themes.map((theme, index) => (
                            <Dropdown.Item
                                key={index}
                                onClick={() => setSelectedTheme(theme)}
                            >
                                {theme === 'All' ? 'Todos os Temas' : theme}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Card.Header>
            <Card.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {filteredCandidates.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        Nenhum candidato encontrado para este tema.
                    </Alert>
                ) : (
                    <ListGroup>
                        {filteredCandidates.map((candidate, index) => (
                            <ListGroup.Item key={index} className="d-flex flex-column">
                                {/* Linha superior: Nome e botões */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{candidate.nome}</strong>
                                    </div>
                                    <div>
                                        <Button 
                                            variant="info"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {
                                                onViewCandidadeInfo(true)
                                                onSelectCandidate(candidate)
                                            }}>
                                            Detalhes
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                onViewCandidadeInfo(false)
                                                onSelectCandidate(candidate)
                                            }}
                                        >
                                            Avaliar
                                        </Button>
                                    </div>
                                </div>

                                {/* Linha inferior: Tema */}
                                <div className="mt-1 text-muted small">
                                    {candidate.tema}
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