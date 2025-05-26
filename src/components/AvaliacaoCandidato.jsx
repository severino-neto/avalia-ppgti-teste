import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import FormularioAvaliacaoPP from './FormularioAvaliacaoPP';
import FormularioEntrevista from './FormularioEntrevista';
import FormularioCurriculo from './FormularioCurriculo';

const AvaliacaoCandidato = ({ selectedCandidate }) => {
  const [activeEvaluationTab, setActiveEvaluationTab] = useState(null);
  const SubmitFormularioPP = (valores) => {
    console.log('Dados recebidos do FormularioAvaliacaoPP:', valores, selectedCandidate.nome);
    // Lógica para salvar os dados
    alert('Avaliação enviada com sucesso!');
  };
  const SubmitEntrevista = (valores) => {
    console.log('Dados do FormularioEntrevista:', valores, selectedCandidate.nome);
    // Lógica para salvar os dados
    alert('Avaliação enviada com sucesso!');
  };
   const salvarCurriculo = (valores) => {
    console.log('Dados do FormularioCurriculo:', valores, selectedCandidate.nome);
     // Lógica para salvar os dados
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
                <FormularioAvaliacaoPP onSubmit={SubmitFormularioPP} />
              </div>
            )}

            {activeEvaluationTab === 'interview' && (
              <FormularioEntrevista onSubmit={SubmitEntrevista} />
            )}

            {activeEvaluationTab === 'resume' && (
              <FormularioCurriculo onSubmit={salvarCurriculo} />
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