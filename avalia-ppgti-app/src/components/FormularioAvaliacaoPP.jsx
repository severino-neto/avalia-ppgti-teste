import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const FormularioAvaliacaoPP = ({ onSubmit }) => {
  const [valores, setValores] = useState({
    aderencia: '',
    problema: '',
    justificativa: '',
    fundamentacao: '',
    objetivos: '',
    metodologia: ''
  });

  const [erros, setErros] = useState({
    aderencia: false,
    problema: false,
    justificativa: false,
    fundamentacao: false,
    objetivos: false,
    metodologia: false
  });

  const camposConfig = {
    aderencia: { label: 'Grau de aderência do projeto de pesquisa com o tema', min: 0, max: 10 },
    problema: { label: 'Clareza e delimitação do problema de pesquisa', min: 0, max: 15 },
    justificativa: { label: 'Clareza e relevância da justificativa do projeto', min: 0, max: 10 },
    fundamentacao: { label: 'Atualidade e clareza da fundamentação teórica e descrição/análise de trabalhos relacionados', min: 0, max: 30 },
    objetivos: { label: 'Clareza e precisão da proposta e objetivos', min: 0, max: 20 },
    metodologia: { label: 'Adequação dos procedimentos metodológicos à problemática de pesquisa', min: 0, max: 15 }
  };

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
      onSubmit(valores);
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

      <Button variant="success" type="submit">Salvar Avaliação</Button>

      {Object.values(erros).some(erro => erro) && (
        <Alert variant="danger" className="mt-3">
          Corrija os campos destacados em vermelho antes de enviar.
        </Alert>
      )}
    </Form>
  );
};

export default FormularioAvaliacaoPP;