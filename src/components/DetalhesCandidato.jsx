import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Container } from 'react-bootstrap';

const DetalhesCandidato = ({ selectedCandidate }) => {
    const [valores, setValores] = useState({
        nome: '',
        CPF: '',
        email: '',
        dataDeNascimento: '',
        cotista: '',
        modalidadeDaCota: '',
        // anexo1: '',
        // anexo2: '',
        // anexo3: '',
        // anexo4: ''
    });

    const camposConfig = {
        nome: { label: 'Nome' },
        CPF: { label: 'CPF' },
        email: { label: 'Email' },
        dataDeNascimento: { label: 'Data de nascimento' },
        cotista: { label: 'É cotista' },
        modalidadeDaCota: { label: 'Modalidade da cota' },
        // anexo1: { label: 'Anexo 1' },
        // anexo2: { label: 'Anexo 2' },
        // anexo3: { label: 'Anexo 3' },
        // anexo4: { label: 'Anexo 4' }
    };

    useEffect(() => {
        setValores({
            nome: selectedCandidate.nome || '',
            CPF: selectedCandidate.cpf || '',
            email: selectedCandidate.email || '',
            dataDeNascimento: selectedCandidate.dataNascimento || '',
            cotista: selectedCandidate.cotista ? 'Sim' : 'Não' || '',
            modalidadeDaCota: selectedCandidate.cotista ? selectedCandidate.modalidadeCota : 'Não consta' || '',
        })
    }, [selectedCandidate])

    return (
        <Card>
            <Card.Header>
                <h5>Detalhes</h5>
            </Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Row>
                            <Col>
                                <Form.Label className="mb-0"><h6><strong>{camposConfig['nome'].label}</strong></h6></Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    step="1"
                                    placeholder={' '}
                                    value={valores['nome']}
                                    readOnly={true}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label className="mb-0"><h6><strong>{camposConfig['CPF'].label}</strong></h6></Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    step="1"
                                    placeholder={' '}
                                    value={valores['CPF']}
                                    readOnly={true}
                                />
                            </Col>
                            <Col>
                                <Form.Label className="mb-0"><h6><strong>{camposConfig['dataDeNascimento'].label}</strong></h6></Form.Label>
                                <Form.Control
                                    type="text"
                                    step="1"
                                    placeholder={' '}
                                    value={valores['dataDeNascimento']}
                                    readOnly={true}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label className="mb-0"><h6><strong>{camposConfig['email'].label}</strong></h6></Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    step="1"
                                    placeholder={' '}
                                    value={valores['email']}
                                    readOnly={true}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label className="mb-0"><h6><strong>{camposConfig['cotista'].label}</strong></h6></Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    step="1"
                                    placeholder={' '}
                                    value={valores['cotista']}
                                    readOnly={true}
                                />
                            </Col>
                            <Col>
                                <Form.Label className="mb-0"><h6><strong>{camposConfig['modalidadeDaCota'].label}</strong></h6></Form.Label>
                                <Form.Control
                                    className="mb-3"
                                    type="text"
                                    step="1"
                                    placeholder={' '}
                                    value={valores['modalidadeDaCota']}
                                    readOnly={true}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                </Form>
                <Container>
                    <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        href={selectedCandidate.preProjeto}
                        target="_blank">
                        Pré-projeto
                    </Button>
                    <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        href={selectedCandidate.curriculo}
                        target="_blank">
                        Currículo
                    </Button>
                    <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        href={selectedCandidate.lattesLink}
                        target="_blank">
                        Lattes
                    </Button>
                </Container>
            </Card.Body>
        </Card>
    );
};

export default DetalhesCandidato;