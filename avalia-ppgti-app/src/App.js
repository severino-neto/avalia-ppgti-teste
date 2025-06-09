import React, { useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Interfacevaliacao from './components/InterfaceAvaliacao';
import InterfaceResultadoPorEtapa from './components/InterfaceResultadoPorEtapa';
import InterfaceClassificacao from './components/InterfaceClassificacao';
import InterfaceLogin from './components/InterfaceLogin';

// Dados dos candidatos (pode ser movido para um arquivo JSON separado)
const candidatosData = {
  "candidatos": [
    // ... (seus dados de candidatos aqui)
  ]
};


const App = () => {

  return (
     <Router>
      <Navbar bg="light" variant="light" expand="lg">
        <Container>
          <Navbar.Brand href='/'>AVALIA PPGTI</Navbar.Brand>
           <Navbar.Toggle aria-controls="navbar-nav" />
             <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Avaliação</Nav.Link>
            <Nav.Link as={Link} to="/resultado">Resultado por Etapa</Nav.Link>
            <Nav.Link as={Link} to="/classificacao">Classificação</Nav.Link>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Interfacevaliacao />} />
          <Route path="/resultado" element={<InterfaceResultadoPorEtapa />} />
          <Route path="/classificacao" element={<InterfaceClassificacao />} />
          <Route path="/login" element={<InterfaceLogin />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;