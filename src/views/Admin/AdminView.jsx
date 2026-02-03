import React, { useState, useEffect } from 'react';
import { Lock, Trash2, Calendar } from 'lucide-react';

// Import de Serviços
import { agendamentoService, authService } from '../../services/api';

// Import de Componentes de UI
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

// Import de Utilitários
import { getHoje } from '../../utils/dateUtils';

const AdminView = ({ onLogout }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [dataAgenda, setDataAgenda] = useState(getHoje());

  // Carrega a agenda sempre que a data mudar ou o login for efetuado
  useEffect(() => { 
    if (isLogged) buscarAgendamentos(); 
  }, [dataAgenda, isLogged]);

  const buscarAgendamentos = async () => {
    setLoading(true);
    try {
      const res = await agendamentoService.listar(dataAgenda);
      // Ordena por horário (08:00 antes de 09:00, etc)
      const ordenados = (res.data || []).sort((a, b) => a.horario.localeCompare(b.horario));
      setAgendamentos(ordenados);
    } catch (error) { 
      console.error("Erro ao carregar agenda", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(userName, senha);
      setIsLogged(true);
    } catch (error) {
      alert("Usuário ou senha incorretos.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("Deseja realmente cancelar este agendamento?")) {
      try {
        await agendamentoService.cancelar(id);
        buscarAgendamentos(); // Atualiza a lista
      } catch (error) {
        alert("Erro ao cancelar agendamento.");
      }
    }
  };

  // --- ESTADO: LOGIN ---
  if (!isLogged) {
    return (
      <div className="max-w-sm mx-auto mt-10 px-4 text-center">
        <Card className="shadow-xl">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-serif mb-6 text-gray-800">Acesso Restrito</h2>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <Input 
              label="Usuário" 
              value={userName} 
              onChange={e => setUserName(e.target.value)} 
              placeholder="Seu usuário" 
            />
            <Input 
              label="Senha" 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              placeholder="Sua senha" 
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Autenticando..." : "Entrar"}
            </Button>
          </form>
          
          <button 
            onClick={onLogout} 
            className="mt-6 text-xs text-gray-400 hover:text-rose-400 transition-colors"
          >
            Voltar ao site
          </button>
        </Card>
      </div>
    );
  }

  // --- ESTADO: PAINEL ADMINISTRATIVO ---
  return (
    <div className="max-w-4xl mx-auto pb-20 px-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-serif text-rose-900">Agenda Diária</h2>
          <p className="text-xs text-gray-400">Gerenciamento de horários</p>
        </div>
        <Button variant="ghost" onClick={() => setIsLogged(false)} className="border border-rose-100">
          Sair
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 mb-6">
        <label className="text-xs font-bold text-rose-300 uppercase mb-2 block ml-1">
          Filtrar por data
        </label>
        <Input 
          type="date" 
          value={dataAgenda} 
          onChange={(e) => setDataAgenda(e.target.value)} 
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-rose-300 text-sm">Buscando agendamentos...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {agendamentos.map(item => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-xl border-l-4 border-rose-400 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="bg-rose-50 p-2 rounded text-center min-w-[60px]">
                  <span className="font-bold text-rose-600 block text-sm">
                    {item.horario.substring(0, 5)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-800 font-medium block">{item.nome}</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase">
                    {item.servico}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleCancelar(item.id)} 
                className="text-red-300 hover:text-red-500 p-2 transition-colors"
                title="Cancelar agendamento"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}

          {agendamentos.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-rose-100">
              <Calendar size={40} className="mx-auto text-rose-100 mb-4" />
              <p className="text-gray-400">Nenhum agendamento encontrado para este dia.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminView;