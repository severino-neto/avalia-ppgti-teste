import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';

const FormularioEntrevista = ({ onSubmit, avaliacaoExistente: inicialAvaliacao  }) => {
  // Estados para controle de edição e notas
  const [emEdicao, setEmEdicao] = useState(false);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [avalicao, setAvaliacao] = useState(false);

  const [valores, setValores] = useState({
    afericao: '',
    dominio: '',
    adequacao: ''
  });

  const [erros, setErros] = useState({
    afericao: false,
    dominio: false,
    adequacao: false
  });

  const camposConfig = {
    afericao: { label: 'Aferição/defesa da proposta de pré-projeto de pesquisa de mestrado', min: 0, max: 30 },
    dominio: { label: 'Demonstração de domínio de conhecimentos no tema pretendido', min: 0, max: 30 },
    adequacao: { label: 'Adequação do candidato para a execução da pesquisa de mestrado', min: 0, max: 40 }
  };

   // Função para calcular a pontuação total
  const calcularPontuacaoTotal = () => {
    let total = 0;
    Object.keys(valores).forEach(campo => {
      const valor = valores[campo];
      if (valor !== '' && !isNaN(valor)) {
        total += parseInt(valor);
      }
    });
    setPontuacaoTotal(total);
    setStatus(total >= 70 ? '✅ Aprovado' : '❌ Reprovado');
  };

   // Efeito para recalcular a pontuação sempre que os valores mudarem
  useEffect(() => {
    calcularPontuacaoTotal();
  }, [valores]);

  // Mock de dados para simulação
  const mockAvaliacao = {
    notas: {
     afericao: 20,
    dominio: 20,
    adequacao: 30
    },
    pontuacaoTotal: 70,
    status: 'Aprovado'
  };

  // Preenche os campos se houver avaliação existente
  useEffect(() => {
    if (inicialAvaliacao) {
      setValores(inicialAvaliacao.notas || {});
      setPontuacaoTotal(inicialAvaliacao.pontuacaoTotal || 0);
      setStatus(inicialAvaliacao.status || '');
      setAvaliacao(false);
    } else {
      // mock da avaliação so para teste, remover depois
      setValores(mockAvaliacao.notas);
      setPontuacaoTotal(mockAvaliacao.pontuacaoTotal);
      setStatus(mockAvaliacao.status);

      setAvaliacao(true);
      //libera o formulário senão tiver uma avaliação existes
      // setEmEdicao(true);
    }
  }, [inicialAvaliacao]);

  const handleChange = (campo, valor) => {
    const num = valor === '' ? null : parseInt(valor);
    
    setValores(prev => ({ ...prev, [campo]: valor }));
    
    const erro = valor !== '' && (
      isNaN(num) || 
      num < camposConfig[campo].min || 
      num > camposConfig[campo].max ||
      !Number.isInteger(num)
    );
    setErros(prev => ({ ...prev, [campo]: erro }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const camposVazios = Object.keys(valores).some(campo => valores[campo] === '');
    const camposComErro = Object.values(erros).some(erro => erro);
    
    if (camposVazios || camposComErro) {
      alert('Por favor, preencha todos os campos corretamente antes de enviar.');
      return;
    }
    
   // Chama a função de submit passada como prop
    if (onSubmit) {
      onSubmit(valores, avalicao);
      console.log(valores, avalicao);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {Object.keys(camposConfig).map((campo) => (
        <Form.Group key={campo} className="mb-3">
          <Form.Label>{camposConfig[campo].label}</Form.Label>
          <Form.Control
            type="number"
            min={camposConfig[campo].min}
            max={camposConfig[campo].max}
            step="1"
            placeholder={`${camposConfig[campo].min} - ${camposConfig[campo].max}`}
            value={valores[campo]}
            onChange={(e) => handleChange(campo, e.target.value)}
            isInvalid={erros[campo]}
            disabled={!emEdicao}
            onBlur={(e) => {
              if (e.target.value > camposConfig[campo].max) {
                e.target.value = camposConfig[campo].max;
              }
              handleChange(campo, e.target.value);
            }}
          />
          <Form.Control.Feedback type="invalid">
            Digite um valor inteiro entre {camposConfig[campo].min} e {camposConfig[campo].max}.
          </Form.Control.Feedback>
        </Form.Group>
      ))}

       <Card className="mb-3">
        <Card.Body>
          <Card.Text>
            <strong>Pontuação Total:</strong> {pontuacaoTotal} / 100
            <br />
            <strong>Status:</strong> {pontuacaoTotal >= 70 ? '✅ Aprovado' : '❌ Reprovado'}
          </Card.Text>
        </Card.Body>
      </Card>

       <Button
        variant={emEdicao ? 'success' : 'primary'}
        onClick={(e) => {
          if (emEdicao) {
            setAvaliacao(false);
            handleSubmit(e); // Envia o formulário
            setEmEdicao(false);
          } else {
            setEmEdicao(true); // Habilita a edição
          }
        }}
      >
        {emEdicao ? 'Salvar Avaliação' : 'Editar Avaliação'}
      </Button>

      {Object.values(erros).some(erro => erro) && (
        <Alert variant="danger" className="mt-3">
          Corrija os campos destacados em vermelho antes de enviar.
        </Alert>
      )}
    </Form>
  );
};

export default FormularioEntrevista;