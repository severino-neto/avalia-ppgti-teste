import React, { useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';

const DetalhesCandidato = ({ selectedCandidate }) => {
    const [valores, setValores] = useState({
        nome: '',
        email: '',
        dataDeNascimento: '',
        cotista: '',
        modalidadeDaCota: '',
        // anexo1: '',
        // anexo2: '',
        // anexo3: '',
        // anexo4: ''
    });

    const [erros, setErros] = useState({
        nome: false,
        email: false,
        dataDeNascimento: false,
        cotista: false,
        modalidadeDaCota: false,
        // anexo1: '',
        // anexo2: '',
        // anexo3: '',
        // anexo4: ''
    });

    const camposConfig = {
        nome: { label: 'Nome' },
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
            email: selectedCandidate.email || '',
            dataDeNascimento: selectedCandidate.dataNascimento || '',
            cotista: selectedCandidate.cotista ? 'Sim' : 'Nao' || '',
            modalidadeDaCota: selectedCandidate.cotista ? selectedCandidate.modalidadeCota : 'Nao consta' || '',
        })
    },[selectedCandidate])

    return (
        <Card>
            <Card.Header>
                <h5>Detalhes</h5>
                {console.log(selectedCandidate)}
            </Card.Header>
            <Card.Body>
                <Form>
                    {Object.keys(camposConfig).map((campo) => (
                        <Form.Group key={campo} className="mb-3">
                            <Form.Label><h6>{camposConfig[campo].label}</h6></Form.Label>
                            <Form.Control
                                type="text"
                                step="1"
                                placeholder={' '}
                                value={valores[campo]}
                                readOnly={true}
                            />
                        </Form.Group>
                    ))}
                </Form>
            </Card.Body>
        </Card>
    );
};

export default DetalhesCandidato;