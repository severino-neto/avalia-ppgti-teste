import React, { useState, useEffect } from 'react';
import { Table, Tabs, Tab, Dropdown, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_ENDPOINTS } from '../config'; // 🔥 Ajuste para seu arquivo de config

const processStageMap = {
    preProjeto: 2,
    entrevista: 3,
    curriculo: 1,
};

const processApiData = (apiData, etapa) => {
    const groupedByLineAndTheme = apiData.reduce((acc, item) => {
        const key = `${item.researchLineName}|${item.researchTopicName}`;
        if (!acc[key]) {
            acc[key] = {
                linhaPesquisa: item.researchLineName,
                temaPesquisa: item.researchTopicName,
                candidatos: [],
            };
        }
        acc[key].candidatos.push({
            nome: item.candidateName,
            cota: item.quotaName ? true : false,
            nota: item.totalStageScore,
            status: item.isEliminatedInStage ? 'Reprovado' : 'Aprovado',
        });
        return acc;
    }, {});

    return Object.values(groupedByLineAndTheme);
};

const ClassificacaoPorEtapa = ({ processId = 1 }) => {
    const [activeTab, setActiveTab] = useState('preProjeto');
    const [data, setData] = useState({});
    const [filters, setFilters] = useState({
        linhaPesquisa: '',
        temaPesquisa: '',
        status: '',
    });

    const fetchData = async (etapa) => {
        const stageId = processStageMap[etapa];
        const url = `${API_ENDPOINTS.RANKING_BY_STAGE(processId, stageId)}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Erro ao buscar ranking');
            const json = await res.json();
            const processed = processApiData(json, etapa);
            setData(prev => ({ ...prev, [etapa]: processed }));
        } catch (error) {
            console.error(`Erro carregando dados da etapa ${etapa}:`, error);
        }
    };

    useEffect(() => {
        Object.keys(processStageMap).forEach(etapa => fetchData(etapa));
    }, []);

    const handleFilterChange = (filterType, value) => {
        setFilters({ ...filters, [filterType]: value });
    };

    const getFilteredData = (stageData) => {
        if (!stageData) return [];
        return stageData
            .filter(item => filters.linhaPesquisa ? item.linhaPesquisa === filters.linhaPesquisa : true)
            .filter(item => filters.temaPesquisa ? item.temaPesquisa === filters.temaPesquisa : true)
            .map(item => ({
                ...item,
                candidatos: item.candidatos.filter(c => filters.status ? c.status === filters.status : true)
            }))
            .filter(item => item.candidatos.length > 0);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        let yPos = 20;
        const filteredData = getFilteredData(data[activeTab]);

        if (filteredData.length === 0) {
            alert('Nenhum dado filtrado para exportar!');
            return;
        }

        doc.setFontSize(16);
        doc.text(`Etapa: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 10, yPos);
        yPos += 10;

        doc.setFontSize(10);
        let filterInfo = 'Filtros aplicados: ';
        if (filters.linhaPesquisa) filterInfo += `Linha: ${filters.linhaPesquisa} `;
        if (filters.temaPesquisa) filterInfo += `Tema: ${filters.temaPesquisa} `;
        if (filters.status) filterInfo += `Status: ${filters.status}`;

        if (filterInfo !== 'Filtros aplicados: ') {
            doc.text(filterInfo, 10, yPos);
            yPos += 7;
        }

        filteredData.forEach(group => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.text(`Linha de Pesquisa: ${group.linhaPesquisa}`, 10, yPos);
            yPos += 7;
            doc.text(`Tema de Pesquisa: ${group.temaPesquisa}`, 10, yPos);
            yPos += 10;

            const tableData = group.candidatos.map(c => [
                c.nome,
                c.cota ? 'Sim' : 'Não',
                c.nota.toString(),
                c.status,
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Nome', 'Cota', 'Nota', 'Status']],
                body: tableData,
                margin: { top: 10 },
                styles: { overflow: 'linebreak', cellWidth: 'wrap' },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 'auto' }
                }
            });

            yPos = doc.lastAutoTable.finalY + 10;
        });

        doc.save('candidatos_filtrados.pdf');
    };

    const renderTable = (stageData) => {
        return stageData.map((item, index) => (
            <div key={index} className="mb-4">
                <h5>Linha de Pesquisa: {item.linhaPesquisa}</h5>
                <h6>Tema de Pesquisa: {item.temaPesquisa}</h6>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Nome do Candidato</th>
                            <th>Optante por Cota</th>
                            <th>Nota</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item.candidatos.map((c, idx) => (
                            <tr key={idx}>
                                <td>{c.nome}</td>
                                <td>{c.cota ? 'Sim' : 'Não'}</td>
                                <td>{c.nota}</td>
                                <td>{c.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        ));
    };

    const uniqueOptions = (key) => {
        const options = new Set();
        Object.values(data).forEach(stage => {
            stage?.forEach(item => {
                if (key === 'status') {
                    item.candidatos.forEach(c => options.add(c[key]));
                } else {
                    options.add(item[key]);
                }
            });
        });
        return Array.from(options);
    };

    return (
        <div className="container mt-4">
            <h2>Resultados Por Etapa</h2>
            <div className="d-flex justify-content-between align-items-center my-3">
                <Dropdown onSelect={(e) => handleFilterChange('linhaPesquisa', e)}>
                    <Dropdown.Toggle variant="primary">
                        {filters.linhaPesquisa || 'Linha de Pesquisa'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="">Todos</Dropdown.Item>
                        {uniqueOptions('linhaPesquisa').map((opt, idx) => (
                            <Dropdown.Item key={idx} eventKey={opt}>{opt}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown onSelect={(e) => handleFilterChange('temaPesquisa', e)}>
                    <Dropdown.Toggle variant="primary">
                        {filters.temaPesquisa || 'Tema de Pesquisa'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="">Todos</Dropdown.Item>
                        {uniqueOptions('temaPesquisa').map((opt, idx) => (
                            <Dropdown.Item key={idx} eventKey={opt}>{opt}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown onSelect={(e) => handleFilterChange('status', e)}>
                    <Dropdown.Toggle variant="primary">
                        {filters.status || 'Status'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="">Todos</Dropdown.Item>
                        {uniqueOptions('status').map((opt, idx) => (
                            <Dropdown.Item key={idx} eventKey={opt}>{opt}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Button variant="success" onClick={exportToPDF}>Exportar PDF</Button>
            </div>

            <Tabs
                id="candidate-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="preProjeto" title="Pré-Projeto">
                    {renderTable(getFilteredData(data.preProjeto))}
                </Tab>
                <Tab eventKey="entrevista" title="Entrevista">
                    {renderTable(getFilteredData(data.entrevista))}
                </Tab>
                <Tab eventKey="curriculo" title="Currículo">
                    {renderTable(getFilteredData(data.curriculo))}
                </Tab>
            </Tabs>
        </div>
    );
};

export default ClassificacaoPorEtapa;
