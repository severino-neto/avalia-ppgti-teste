const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// TODO: tornar o id do processo dinâmico futuramente
export const API_ENDPOINTS = {

     // Processos seletivos
    CURRENT_PROCESS: `${BASE_URL}/api/selection-processes/current`,
    CURRENT_PROCESS_WEIGHTS: `${BASE_URL}/api/selection-processes/current/weights`,
    
    // Tópicos de pesquisa
    RESEARCH_TOPICS_BY_PROCESS: (processId) => `${BASE_URL}/api/research-topics/by-process/${processId}`,
    UPDATE_RESEARCH_TOPIC: (id) => `${BASE_URL}/api/research-topics/${id}`,
    
    RESEARCH_TOPICS: `${BASE_URL}/api/research-topics/by-process/1`,

    EVALUATION_CRITERIA_BY_PROCESS_STAGE: (processStageId) =>
        `${BASE_URL}/api/evaluation-criteria/by-process-stage/${processStageId}`,   
    
    HOMOLOGATED_CANDIDATES_BY_TOPIC: (topicId) =>
        `${BASE_URL}/api/applications/homologated-candidates/by-research-topic/${topicId}`,
    
    APLICATIONS_BY_CANDIDATE_ID: (candidateId) => 
        `${BASE_URL}/api/applications/by-candidate/${candidateId}`,
    
    ALL_STAGE_EVALUATIONS: `${BASE_URL}/api/stage-evaluations`,
    
    FIND_STAGE_EVALUATION: (applicationId, processStageId, committeeMemberId) =>
        `${BASE_URL}/api/stage-evaluations/find?applicationId=${applicationId}&processStageId=${processStageId}&committeeMemberId=${committeeMemberId}`,
    
    CRITERION_SCORE_BY_STAGE_EVALUATION_ID: (stageEvaluationId) =>
        `${BASE_URL}/api/criterion-scores/evaluate/${stageEvaluationId}`,

    GET_CRITERION_SCORES_BY_STAGE_EVALUATION: (stageEvaluationId) => 
        `${BASE_URL}/api/criterion-scores/by-stage-evaluation/${stageEvaluationId}`,  

    UPDATE_STAGE_TOTAL_SCORE: (stageEvaluationId) => `${BASE_URL}/api/stage-evaluations/${stageEvaluationId}/total-score`,

    CRITERION_SCORES_BY_STAGE_EVALUATION: (stageEvaluationId) => `${BASE_URL}/api/criterion-scores/by-stage-evaluation/${stageEvaluationId}`,

    RANKING_BY_STAGE: (processId, stageId) => 
      `${BASE_URL}/api/ranking/process/${processId}/stage/${stageId}`,

    RANKING_BY_LINE: (processId, stageId, researchLineId) => 
      `${BASE_URL}/api/ranking/process/${processId}/stage/${stageId}/line/${researchLineId}`,

    RANKING_BY_TOPIC: (processId, stageId, researchTopicId) => 
      `${BASE_URL}/api/ranking/process/${processId}/stage/${stageId}/topic/${researchTopicId}`,

    RESEARCH_TOPICS_BY_PROCESS: (processId) => 
      `${BASE_URL}/api/research-topics/by-process/${processId}`,

    RANKING_BY_STATUS: (processId, stageId, status) => 
      `${BASE_URL}/api/ranking/process/${processId}/stage/${stageId}/status/${status}`,

    RANKING_GERAL: (processId) =>
        `${BASE_URL}/api/ranking/generate/process/${processId}`,

    CALCULATE_TOTAL_STAGE_SCORE: (stageEvalId) => `${BASE_URL}/api/stage-evaluations/${stageEvalId}/calculate-total-score`,


     // Endpoint para GERAR o ranking (POST)
    GENERATE_RANKING: (processId) => `${BASE_URL}/api/ranking/generate/process/${processId}`,
    
    // Endpoint para OBTER o ranking (GET)
    GET_RANKING: (processId) => `${BASE_URL}/api/ranking/process/${processId}`,
    
    // Endpoint para dados por etapa (GET)
    RANKING_BY_STAGE: (processId, stageId) => 
        `${BASE_URL}/api/ranking/process/${processId}/stage/${stageId}`,
    
};