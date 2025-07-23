import FormularioGenerico from './FormularioGenerico';

const FormularioEntrevista = ({
  onSubmit,
  avaliacaoExistente,
  isNovaAvaliacao,
  criterios = [],
  scoresExistentes = [],
}) => {
  return (
    <FormularioGenerico
      titulo="Avaliação da Entrevista"
      classificatorio={false}
      onSubmit={onSubmit}
      avaliacaoExistente={avaliacaoExistente}
      isNovaAvaliacao={isNovaAvaliacao}
      criterios={criterios}
      scoresExistentes={scoresExistentes}
    />
  );
};

export default FormularioEntrevista;
