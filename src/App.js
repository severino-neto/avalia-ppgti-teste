import React, { useState} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ListagemCandidato from './components/ListagemCandidato';
import AvaliacaoCandidato from './components/AvaliacaoCandidato';

// Dados dos candidatos (pode ser movido para um arquivo JSON separado)
const candidatosData = {
  "candidatos": [
    // ... (seus dados de candidatos aqui)
  ]
};


const App = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  return (
      <Container fluid className="mt-4">
        <Row>
          <Col md={6}>
            <ListagemCandidato
              candidatos={candidatosData.candidatos}
              onSelectCandidate={setSelectedCandidate}
            />
          </Col>
          <Col md={6}>
            <AvaliacaoCandidato selectedCandidate={selectedCandidate} />
          </Col>
        </Row>
      </Container>

  );
};

export default App;