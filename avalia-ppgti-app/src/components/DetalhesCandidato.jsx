import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Container } from 'react-bootstrap';

const DetalhesCandidato = ({ selectedCandidate }) => {
    const [valores, setValores] = useState({
        nome: '',
        CPF: '',
        email: '',
        outroEmail: '',
        cotista: '',
        modalidadeDaCota: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cursoGraduacao: '',
        nivelEducacao: '',
        telefone1: '',
        telefone2: '',
        anoEspecializacao: '',
        cursoEspecializacao: '',
        instituicaoEspecializacao: '',
        registro: '',
        estadoRegistro: '',
        localRegistro: '',
        sexo: ''
    });

    const camposConfig = {
        nome: { label: 'Nome' },
        CPF: { label: 'CPF' },
        email: { label: 'Email' },
        outroEmail: { label: 'Outro Email' },
        cotista: { label: 'É cotista' },
        modalidadeDaCota: { label: 'Modalidade da cota' },
        endereco: { label: 'Endereço' },
        numero: { label: 'Número' },
        complemento: { label: 'Complemento' },
        bairro: { label: 'Bairro' },
        cep: { label: 'CEP' },
        cursoGraduacao: { label: 'Curso de Graduação' },
        nivelEducacao: { label: 'Nível de Educação' },
        telefone1: { label: 'Telefone 1' },
        telefone2: { label: 'Telefone 2' },
        anoEspecializacao: { label: 'Ano da Especialização' },
        cursoEspecializacao: { label: 'Curso de Especialização' },
        instituicaoEspecializacao: { label: 'Instituição da Especialização' },
        registro: { label: 'Registro' },
        estadoRegistro: { label: 'Estado do Registro' },
        localRegistro: { label: 'Local do Registro' },
        sexo: { label: 'Sexo' }
    };

    useEffect(() => {
        setValores({
            nome: selectedCandidate.nome || selectedCandidate.name || '',
            CPF: selectedCandidate.cpf || '',
            email: selectedCandidate.email || '',
            outroEmail: selectedCandidate.otherEmail || '',
            cotista: selectedCandidate.cotista ? 'Sim' : 'Não' || '',
            modalidadeDaCota: selectedCandidate.cotista ? selectedCandidate.modalidadeCota : 'Não consta' || '',
            endereco: selectedCandidate.address || '',
            numero: selectedCandidate.addressNumber || '',
            complemento: selectedCandidate.addressComplement || '',
            bairro: selectedCandidate.addressNeighborhood || '',
            cep: selectedCandidate.addressZipcode || '',
            cursoGraduacao: selectedCandidate.graduationCourse || '',
            nivelEducacao: selectedCandidate.educationLevel || '',
            telefone1: selectedCandidate.cellPhone || '',
            telefone2: selectedCandidate.phone || '',
            anoEspecializacao: selectedCandidate.specializationYear || '',
            cursoEspecializacao: selectedCandidate.specializationCourse || '',
            instituicaoEspecializacao: selectedCandidate.specializationInstitution || '',
            registro: selectedCandidate.registration || '',
            estadoRegistro: selectedCandidate.registrationState || '',
            localRegistro: selectedCandidate.registrationPlace || '',
            sexo: selectedCandidate.sex || ''
        });
    }, [selectedCandidate]);

    const renderInput = (key, value) => (
        <Form.Control
            className="mb-3"
            type="text"
            placeholder=" "
            value={value}
            readOnly={true}
            disabled={!value}
        />
    );

    return (
        <Card>
            <Card.Header>
                <h5>Detalhes</h5>
            </Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        {Object.keys(camposConfig).map((key, index) => {
                            if (["numero", "complemento", "bairro", "telefone1", "telefone2"].includes(key) && index < Object.keys(camposConfig).length - 1 && index % 2 === 0) {
                                const nextKey = Object.keys(camposConfig)[index + 1];
                                return (
                                    <Row key={key}>
                                        <Col>
                                            <Form.Label className="mb-0">
                                                <h6><strong>{camposConfig[key].label}</strong></h6>
                                            </Form.Label>
                                            {renderInput(key, valores[key])}
                                        </Col>
                                        <Col>
                                            <Form.Label className="mb-0">
                                                <h6><strong>{camposConfig[nextKey].label}</strong></h6>
                                            </Form.Label>
                                            {renderInput(nextKey, valores[nextKey])}
                                        </Col>
                                    </Row>
                                );
                            }
                            if (!["complemento", "bairro", "telefone2"].includes(key)) {
                                return (
                                    <Row key={key}>
                                        <Col>
                                            <Form.Label className="mb-0">
                                                <h6><strong>{camposConfig[key].label}</strong></h6>
                                            </Form.Label>
                                            {renderInput(key, valores[key])}
                                        </Col>
                                    </Row>
                                );
                            }
                            return null;
                        })}
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
