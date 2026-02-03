import axios from 'axios';

// Ajuste a URL base conforme o seu backend Spring Boot
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export const agendamentoService = {
  // Buscar todos os agendamentos (filtro opcional por data)
  listar: async (data = null) => {
    const params = data ? { data } : {};
    return api.get('/agendamentos', { params });
  },

  // Criar novo agendamento
  criar: async (dados) => {
    // dados: { nomeCliente, data, horario, servico, etc }
    return api.post('/agendamentos', dados);
  },

  // Cancelar/Deletar agendamento
  cancelar: async (id) => {
    return api.delete(`/agendamentos/${id}`);
  },
  
  // Atualizar (caso necessário no futuro)
  atualizar: async (id, dados) => {
    return api.put(`/agendamentos/${id}`, dados);
  }
};

// Adicione isso dentro do seu objeto de serviços na api.js
export const authService = {
  login: (userName, senha) => {
    // O nome dos campos aqui deve ser igual ao seu DTO Java (LoginRequest)
    return api.post('/admin/login', { userName, senha });
  }
};