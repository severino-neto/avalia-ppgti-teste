import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import FormularioAvaliacaoPP from './FormularioAvaliacaoPP';

const AvaliacaoCandidato = ({ selectedCandidate }) => {
const [activeEvaluationTab, setActiveEvaluationTab] = useState(null);
const handleSubmitFormulario = (dados) => {
              console.log('Dados recebidos do formulário:', dados);
            // Aqui você pode fazer:
            // - Enviar para uma API
            // - Redirecionar o usuário
            // - Atualizar o estado global
            alert('Avaliação enviada com sucesso!');
  };

  return (
    <Card>
      <Card.Header>
        <h5>Avaliação</h5>
      </Card.Header>
      <Card.Body>
        {selectedCandidate ? (
          <>
            <div className="mb-4">
              <h6>Candidato: {selectedCandidate.nome}</h6>
              <p className="text-muted">{selectedCandidate.tema}</p>
            </div>

            <div className="d-flex mb-4">
              <Button
                variant={activeEvaluationTab === 'preProject' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveEvaluationTab('preProject')}
              >
                Pré Projeto
              </Button>
              <Button
                variant={activeEvaluationTab === 'interview' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveEvaluationTab('interview')}
              >
                Entrevista
              </Button>
              <Button
                variant={activeEvaluationTab === 'resume' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveEvaluationTab('resume')}
              >
                Currículo
              </Button>
            </div>

            {activeEvaluationTab === 'preProject' && (
          
            <div>
              <h2>Avaliação de Projeto</h2>
              <FormularioAvaliacaoPP onSubmit={handleSubmitFormulario} />
            </div>
           )}

            {activeEvaluationTab === 'interview' && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nota da Entrevista (0-10)</Form.Label>
                  <Form.Control type="number" min="0" max="10" step="1" />
                </Form.Group>
                <Button variant="success">Salvar Avaliação</Button>
              </Form>
            )}

            {activeEvaluationTab === 'resume' && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nota do Currículo (0-10)</Form.Label>
                  <Form.Control type="number" min="0" max="10" step="1" />
                </Form.Group>
                <Button variant="success">Salvar Avaliação</Button>
              </Form>
            )}

            {!activeEvaluationTab && (
              <div className="text-center text-muted">
                <p>Selecione um tipo de avaliação para começar</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted">
            <p>Selecione um candidato para avaliar</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AvaliacaoCandidato;