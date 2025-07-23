import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

const FormularioGenerico = ({
  onSubmit,
  onRefresh,
  avaliacaoExistente: inicialAvaliacao, //TODO: remover
  isNovaAvaliacao,
  criterios = [],
  titulo = 'Formulário de Avaliação',
  classificatorio = false,
  scoresExistentes = []
}) => {
  const [estadoInternoDeEdicao, setEstadoInternoDeEdicao] = useState(false);
  const emEdicao = isNovaAvaliacao ? true : estadoInternoDeEdicao;

  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [valores, setValores] = useState({});
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(!criterios.length);

  const calcularPontuacaoTotal = () => {
    const total = Object.values(valores).reduce(
      (sum, v) => sum + (parseFloat(v) || 0),
      0
    );
    setPontuacaoTotal(total);
  };

  useEffect(() => {
    calcularPontuacaoTotal();
  }, [valores]);

  useEffect(() => {
    const initialValues = {};
    const initialErrors = {};

    const preencherCampos = (lista) => {
      lista.forEach(c => {
        const nota =
          scoresExistentes?.find(s => s.evaluationCriterionId === c.id)?.scoreObtained ??
          inicialAvaliacao?.scores?.find(s => s.evaluationCriterionId === c.id)?.scoreValue;

        if (c.leaf) {
          initialValues[c.id] = nota ?? '';
          initialErrors[c.id] = false;
        }
        if (c.children) preencherCampos(c.children);
      });
    };

    preencherCampos(criterios);

    setValores(initialValues);
    setErros(initialErrors);
    setPontuacaoTotal(inicialAvaliacao?.totalStageScore || 0);
    setLoading(false);
  }, [inicialAvaliacao, criterios, scoresExistentes]);

  const handleChange = (id, value, max) => {
    const num = value === '' ? null : parseFloat(value);
    setValores(prev => ({ ...prev, [id]: value }));

    const erro =
      value !== '' &&
      (isNaN(num) || num < 0 || num > max || !Number.isFinite(num));

    setErros(prev => ({ ...prev, [id]: erro }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const camposVazios = Object.values(valores).some(v => v === '');
    const camposComErro = Object.values(erros).some(e => e);

    if (camposVazios || camposComErro) {
      alert('Por favor, preencha todos os campos corretamente antes de enviar.');
      return;
    }

    if (onSubmit) {
      onSubmit(valores, isNovaAvaliacao, pontuacaoTotal);
    }

    if (onRefresh) {
      onRefresh();
    }
  };

  const renderCriterion = (criterio) => {
    if (criterio.leaf) {
      return (
        <Form.Group key={criterio.id} className="mb-3">
          <Form.Label>{criterio.description}</Form.Label>
          <Form.Control
            type="number"
            min={0}
            max={criterio.maximumScore}
            step="0.01"
            placeholder={`0 - ${criterio.maximumScore}`}
            value={valores[criterio.id] ?? ''}
            onChange={(e) =>
              handleChange(criterio.id, e.target.value, criterio.maximumScore)
            }
            isInvalid={erros[criterio.id]}
            disabled={!isNovaAvaliacao && !emEdicao}
          />
          <Form.Control.Feedback type="invalid">
            Digite um valor entre 0 e {criterio.maximumScore}.
          </Form.Control.Feedback>
        </Form.Group>
      );
    }

    return (
      <Card key={criterio.id} className="mb-3">
        <Card.Header>
          <strong>{criterio.description}</strong> (máx {criterio.maximumScore})
        </Card.Header>
        <Card.Body>
          {criterio.children &&
            criterio.children.map(child => renderCriterion(child))}
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" size="sm" /> Carregando critérios...
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="ms-3">
        <h5 className="mb-4">{titulo}</h5>

        {criterios.map(criterio => renderCriterion(criterio))}

        <Card className="mb-3">
          <Card.Body>
            <Card.Text>
              <strong>Pontuação Total:</strong> {pontuacaoTotal}
              <br />
              <strong>Status:</strong>{' '}
              {classificatorio
                ? 'Etapa somente classificatória'
                : pontuacaoTotal >= 70
                ? '✅ Aprovado'
                : '❌ Reprovado'}
            </Card.Text>
          </Card.Body>
        </Card>

        {isNovaAvaliacao ? (
          <Button
            variant="success"
            onClick={(e) => {
              handleSubmit(e);
            }}
          >
            Salvar Avaliação
          </Button>
        ) : (
          <Button
            variant={emEdicao ? 'success' : 'primary'}
            onClick={(e) => {
              if (emEdicao) {
                handleSubmit(e);
                setEstadoInternoDeEdicao(false);
              } else {
                setEstadoInternoDeEdicao(true);
              }
            }}
          >
            {emEdicao ? 'Salvar Edição' : 'Editar Avaliação'}
          </Button>
        )}

        {Object.values(erros).some(e => e) && (
          <Alert variant="danger" className="mt-3">
            Corrija os campos destacados em vermelho antes de enviar.
          </Alert>
        )}
      </div>
    </Form>
  );
};

export default FormularioGenerico;
