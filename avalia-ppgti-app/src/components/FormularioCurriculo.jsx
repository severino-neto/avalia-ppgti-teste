import FormularioGenerico from './FormularioGenerico';

const FormularioCurriculo = ({
  onSubmit,
  avaliacaoExistente,
  isNovaAvaliacao,
  criterios = [],
  scoresExistentes = []
}) => {
  return (
    <FormularioGenerico
      titulo="Análise Curricular"
      classificatorio={true}
      onSubmit={onSubmit}
      avaliacaoExistente={avaliacaoExistente}
      isNovaAvaliacao={isNovaAvaliacao}
      criterios={criterios}
      scoresExistentes={scoresExistentes}
    />
  );
};

export default FormularioCurriculo;
