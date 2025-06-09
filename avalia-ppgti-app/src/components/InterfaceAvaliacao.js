import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ListagemCandidato from './ListagemCandidato';
import AvaliacaoCandidato from './AvaliacaoCandidato';
import DetalhesCandidato from './DetalhesCandidato';

// Dados dos candidatos (você pode manter isso no arquivo original ou importar de um JSON separado)
const candidatosData = {
  "candidatos": [
    // ... seus dados de candidatos aqui ...
  ]
};

const Interfacevaliacao = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewCandidateInfo, setViewCandidateInfo] = useState(false);

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={6}>
          <ListagemCandidato
            candidatos={candidatosData.candidatos}
            onSelectCandidate={setSelectedCandidate}
            onViewCandidadeInfo={setViewCandidateInfo}
          />
        </Col>
        <Col md={6}>
          {!viewCandidateInfo && <AvaliacaoCandidato selectedCandidate={selectedCandidate} />}
          {viewCandidateInfo && <DetalhesCandidato selectedCandidate={selectedCandidate} />}
        </Col>
      </Row>
    </Container>
  );
};

export default Interfacevaliacao;
