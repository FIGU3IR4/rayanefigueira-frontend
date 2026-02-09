import React, { useState, useEffect } from 'react';
import { Lock, Trash2, Calendar, Phone, DollarSign } from 'lucide-react';

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

  useEffect(() => { 
    if (isLogged) buscarAgendamentos(); 
  }, [dataAgenda, isLogged]);

  const buscarAgendamentos = async () => {
    setLoading(true);
    try {
      const res = await agendamentoService.listar(dataAgenda);
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

  // Função atualizada para disparar DELETE /agendamentos/{id}
  const handleCancelar = async (id) => {
    if (window.confirm("Deseja realmente excluir permanentemente este agendamento?")) {
      setLoading(true);
      try {
        // Certifique-se que agendamentoService.cancelar faz o DELETE para a URL correta
        await agendamentoService.cancelar(id); 
        
        // Remove localmente do estado para resposta imediata na UI
        setAgendamentos(prev => prev.filter(ag => ag.id !== id));
        
        alert("Agendamento excluído com sucesso.");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao excluir agendamento. Tente novamente.");
        // Recarrega caso ocorra erro para sincronizar estado
        buscarAgendamentos();
      } finally {
        setLoading(false);
      }
    }
  };

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined) return "0,00";
    return String(valor).replace('.', ',');
  };

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
          <button onClick={onLogout} className="mt-6 text-xs text-gray-400">Voltar ao site</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 mt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-rose-900">Agenda da Rayane</h2>
          <p className="text-sm text-gray-500">Controle financeiro e de horários</p>
        </div>
        <Button variant="outline" onClick={() => setIsLogged(false)} className="border-rose-200 text-rose-700">
          Sair
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 mb-8">
        <label className="text-xs font-bold text-rose-400 uppercase mb-2 block">
          Visualizar Dia
        </label>
        <Input 
          type="date" 
          value={dataAgenda} 
          onChange={(e) => setDataAgenda(e.target.value)} 
        />
      </div>

      {loading && agendamentos.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-rose-300">Carregando dados...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {agendamentos.map(item => (
            <div 
              key={item.id} 
              className={`bg-white p-5 rounded-2xl border-l-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm transition-all border-rose-400`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
                <div className="bg-rose-50 p-3 rounded-xl text-center min-w-[75px]">
                  <span className="font-bold text-rose-600 block text-lg">
                    {item.horario?.substring(0, 5)}
                  </span>
                </div>

                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-900 font-bold text-lg">{item.nome}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-100 text-green-700">
                      Agendado
                    </span>
                    
                    {item.valorPix && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        <DollarSign size={10} /> Valor : R$ {formatarMoeda(item.valorPix)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg font-medium">
                      {item.servico}
                    </span>
                    <a 
                      href={`https://wa.me/55${item.numeroCliente?.replace(/\D/g, '')}`} 
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-green-600 hover:underline font-medium"
                    >
                      <Phone size={14} /> {item.numeroCliente || 'Sem telefone'}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 md:mt-0 ml-auto md:ml-0">
                  <button 
                    onClick={() => handleCancelar(item.id)} 
                    className="text-red-200 hover:text-red-600 p-3 transition-colors hover:bg-red-50 rounded-full"
                    disabled={loading}
                  >
                    <Trash2 size={22}/>
                  </button>
              </div>
            </div>
          ))}

          {agendamentos.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-rose-100">
              <Calendar size={48} className="mx-auto text-rose-100 mb-4" />
              <p className="text-gray-400 font-medium">Nenhum agendamento para este dia.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminView;