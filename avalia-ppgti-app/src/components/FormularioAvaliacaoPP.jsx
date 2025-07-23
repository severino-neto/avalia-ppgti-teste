import FormularioGenerico from './FormularioGenerico';

const FormularioAvaliacaoPP = ({
  onSubmit,
  avaliacaoExistente,
  isNovaAvaliacao,
  criterios = [],
  scoresExistentes = []
}) => {
  return (
    <FormularioGenerico
      titulo="Avaliação do Pré-Projeto"
      classificatorio={false}
      onSubmit={onSubmit}
      avaliacaoExistente={avaliacaoExistente}
      isNovaAvaliacao={isNovaAvaliacao}
      criterios={criterios}
      scoresExistentes={scoresExistentes}
    />
  );
};

export default FormularioAvaliacaoPP;
