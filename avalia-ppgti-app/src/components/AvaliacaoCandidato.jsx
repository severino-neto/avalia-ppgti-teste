import React, { useEffect, useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import FormularioAvaliacaoPP from './FormularioAvaliacaoPP';
import FormularioEntrevista from './FormularioEntrevista';
import FormularioCurriculo from './FormularioCurriculo';
import { API_ENDPOINTS } from '../config'; 

const AvaliacaoCandidato = ({ selectedCandidate }) => {
  const [activeEvaluationTab, setActiveEvaluationTab] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationError, setApplicationError] = useState(null);
  const [loadingApplicationId, setLoadingApplicationId] = useState(false);
  const [stageEvaluationId, setStageEvaluationId] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    if (selectedCandidate && selectedCandidate.id) {
      setLoadingApplicationId(true);

      fetch(API_ENDPOINTS.APLICATIONS_BY_CANDIDATE_ID(selectedCandidate.id))
        .then((response) => {
          if (!response.ok) throw new Error('Erro ao buscar application');
          return response.json();
        })
        .then((data) => {
          setApplicationId(data.id);
          setApplicationError(null);
        })
        .catch((err) => {
          console.error(err);
          setApplicationError('Falha ao buscar aplicação do candidato.');
        })
        .finally(() => setLoadingApplicationId(false));
    }
    
  }, [selectedCandidate?.id]);

  const handleStageSelection = (stage) => {
    if (!applicationId) return;

    const processStageMap = {
      resume: 4,
      interview: 6,
      preProject: 5,
    };

    const payload = {
      applicationId,
      processStageId: processStageMap[stage],
      committeeMemberId: 5,
      evaluationDate: new Date().toISOString(),
    };

    fetch(API_ENDPOINTS.ALL_STAGE_EVALUATIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Erro ao criar avaliação');
        return response.json();
      })
      .then((data) => {
        setStageEvaluationId(data.id);
        setSelectedStage(stage);
        setActiveEvaluationTab(stage);
      })
      .catch((err) => {
        console.error('Erro ao registrar avaliação:', err);
      });
  };

  const enviarScores = (valores) => {
    if (!stageEvaluationId || !selectedStage) return;

    const criteriosMap = {
      resume: [
        { campo: 'notaCurriculo', criterioId: 19, max: 100.0 },
      ],
      interview: [
        { campo: 'afericao', criterioId: 16, max: 30.0 },
        { campo: 'dominio', criterioId: 17, max: 30.0 },
        { campo: 'adequacao', criterioId: 18, max: 40.0 },
      ],
      preProject: [
        { campo: 'aderencia', criterioId: 10, max: 10.0 },
        { campo: 'problema', criterioId: 11, max: 15.0 },
        { campo: 'justificativa', criterioId: 12, max: 10.0 },
        { campo: 'fundamentacao', criterioId: 13, max: 30.0 },
        { campo: 'objetivos', criterioId: 14, max: 20.0 },
        { campo: 'metodologia', criterioId: 15, max: 15.0 },
      ],
    };

    const scores = criteriosMap[selectedStage]
      .filter(({ campo }) => valores[campo] !== undefined)
      .map(({ campo, criterioId }) => ({
        evaluationCriterionId: criterioId,
        scoreValue: parseFloat(valores[campo]),
      }));

    fetch(API_ENDPOINTS.CRITERION_SCORE_BY_STAGE_EVALUATION_ID(stageEvaluationId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Erro ao enviar pontuações');
        return response.json();
      })
      .then(() => {
        alert('Pontuações enviadas com sucesso!');
      })
      .catch((err) => {
        console.error('Erro ao enviar pontuações:', err);
      });
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
              <h6>Candidato: {selectedCandidate.name}</h6>
              <p className="text-muted">Tema: {selectedCandidate.topicName}</p>
            </div>
            {loadingApplicationId ? (
              <div className="text-center">
                <Spinner animation="border" size="sm" /> Carregando dados da aplicação...
              </div>
            ) : applicationError ? (
              <Alert variant="danger">{applicationError}</Alert>
            ) : (
              <>
                <div className="d-flex mb-4">
                  <Button
                    variant={activeEvaluationTab === 'preProject' ? 'primary' : 'outline-primary'}
                    className="me-2"
                    onClick={() => handleStageSelection('preProject')}
                  >
                    Pré Projeto
                  </Button>
                  <Button
                    variant={activeEvaluationTab === 'interview' ? 'primary' : 'outline-primary'}
                    className="me-2"
                    onClick={() => handleStageSelection('interview')}
                  >
                    Entrevista
                  </Button>
                  <Button
                    variant={activeEvaluationTab === 'resume' ? 'primary' : 'outline-primary'}
                    onClick={() => handleStageSelection('resume')}
                  >
                    Currículo
                  </Button>
                </div>

                {activeEvaluationTab === 'preProject' && (
                  <FormularioAvaliacaoPP onSubmit={enviarScores} />
                )}

                {activeEvaluationTab === 'interview' && (
                  <FormularioEntrevista onSubmit={enviarScores} />
                )}

                {activeEvaluationTab === 'resume' && (
                  <FormularioCurriculo onSubmit={enviarScores} />
                )}

                {!activeEvaluationTab && (
                  <div className="text-center text-muted">
                    <p>Selecione um tipo de avaliação para começar</p>
                  </div>
                )}
              </>
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