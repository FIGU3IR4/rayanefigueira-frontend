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

  const handleCancelar = async (id) => {
    if (window.confirm("Deseja realmente excluir permanentemente este agendamento?")) {
      setLoading(true);
      try {
        await agendamentoService.cancelar(id); 
        setAgendamentos(prev => prev.filter(ag => ag.id !== id));
        alert("Agendamento excluído com sucesso.");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao excluir agendamento. Tente novamente.");
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

  // TELA DE LOGIN ADMIN
  if (!isLogged) {
    return (
      <div className="max-w-sm mx-auto mt-20 px-4 text-center">
        <Card className="shadow-2xl bg-neutral-900 border-neutral-800">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-white border border-neutral-700">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-serif mb-6 text-white uppercase tracking-widest">Login ADM</h2>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <Input 
              label="Usuário" 
              value={userName} 
              onChange={e => setUserName(e.target.value)} 
              placeholder="Digite seu usuário" 
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <Input 
              label="Senha" 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              placeholder="Sua senha" 
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 py-4 font-bold" disabled={loading}>
              {loading ? "Autenticando..." : "Entrar"}
            </Button>
          </form>
          <button onClick={onLogout} className="mt-8 text-xs text-neutral-500 hover:text-white transition-colors">
            Voltar ao site
          </button>
        </Card>
      </div>
    );
  }

  // TELA DE AGENDA LOGADA
  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 mt-6 text-white">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-serif text-white tracking-wide">Agenda Rayane</h2>
          <p className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Gestão Profissional</p>
        </div>
        <Button variant="outline" onClick={() => setIsLogged(false)} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
          Sair
        </Button>
      </div>

      <div className="bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-800 mb-8">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 block">
          Selecione a Data para Visualizar
        </label>
        <Input 
          type="date" 
          value={dataAgenda} 
          onChange={(e) => setDataAgenda(e.target.value)} 
          className="bg-neutral-800 border-neutral-700 text-white"
        />
      </div>

      {loading && agendamentos.length === 0 ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-neutral-700 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-500 font-medium">Buscando horários...</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {agendamentos.map(item => (
            <div 
              key={item.id} 
              className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg transition-all hover:border-neutral-600"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
                <div className="bg-neutral-800 p-3 rounded-xl text-center min-w-[85px] border border-neutral-700">
                  <span className="font-bold text-white block text-lg">
                    {item.horario?.substring(0, 5)}
                  </span>
                </div>

                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white font-bold text-lg tracking-wide">{item.nome}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Confirmado
                    </span>
                    
                    {item.valorPix && (
                      <span className="flex items-center gap-1 text-[10px] bg-green-900/20 text-green-400 border border-green-900/50 px-2 py-0.5 rounded-full font-bold uppercase">
                        <DollarSign size={10} /> Sinal: R$ {formatarMoeda(item.valorPix)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center text-sm">
                    <span className="text-neutral-300 font-medium bg-neutral-800 px-3 py-1 rounded-lg">
                      {item.servico}
                    </span>
                    <a 
                      href={`https://wa.me/55${item.numeroCliente?.replace(/\D/g, '')}`} 
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Phone size={14} /> <span className="underline decoration-neutral-700">{item.numeroCliente || 'Sem telefone'}</span>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-5 md:mt-0 ml-auto md:ml-4">
                  <button 
                    onClick={() => handleCancelar(item.id)} 
                    className="text-neutral-600 hover:text-red-500 p-3 transition-all hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20"
                    disabled={loading}
                    title="Excluir agendamento"
                  >
                    <Trash2 size={20}/>
                  </button>
              </div>
            </div>
          ))}

          {agendamentos.length === 0 && !loading && (
            <div className="text-center py-24 bg-neutral-900 rounded-3xl border border-dashed border-neutral-800">
              <Calendar size={48} className="mx-auto text-neutral-800 mb-4" />
              <p className="text-neutral-600 font-medium">Nenhum agendamento encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminView;