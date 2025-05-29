import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const FormularioEntrevista = ({ onSubmit }) => {
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

export default FormularioEntrevista;