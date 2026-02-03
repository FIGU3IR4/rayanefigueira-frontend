import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

// Import de Serviços
import { agendamentoService } from '../../services/api';

// Import de Componentes de UI
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

// Import de Utilitários e Constantes
import { getHoje } from '../../utils/dateUtils';
import { HORARIOS_DISPONIVEIS, SERVICOS } from '../../constants/config';

const ClientView = ({ onNavigateAdmin }) => {
  const [dataSelecionada, setDataSelecionada] = useState(getHoje());
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [servico, setServico] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    carregarHorarios();
  }, [dataSelecionada]);

  const carregarHorarios = async () => {
    setLoading(true);
    try {
      const response = await agendamentoService.listar(dataSelecionada);
      // Ajuste para tratar o formato do horário vindo da API
      const ocupados = response.data.map(ag => 
        typeof ag.horario === 'string' ? ag.horario.substring(0, 5) : ag.horario
      );
      setHorariosOcupados(ocupados);
    } catch (error) { 
      console.error("Erro ao buscar horários", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleAgendar = async () => {
    if (!nome || !horarioSelecionado || !servico) {
      return alert("Preencha todos os campos.");
    }
    
    setLoading(true);
    try {
      await agendamentoService.criar({ 
        nome, 
        data: dataSelecionada, 
        horario: horarioSelecionado, 
        servico 
      });
      
      setFeedback({ type: 'success', msg: 'Agendamento realizado com sucesso!' });
      setNome(''); 
      setServico(''); 
      setHorarioSelecionado(null);
      carregarHorarios();
    } catch (error) { 
      setFeedback({ type: 'error', msg: 'Erro ao agendar. Tente novamente.' }); 
    } finally { 
      setLoading(false); 
      // Remove o feedback após 5 segundos
      setTimeout(() => setFeedback({ type: '', msg: '' }), 5000); 
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pb-10">
      <div className="text-center mb-6 px-4">
        <h2 className="text-2xl font-serif text-rose-900 mb-2">Agende seu Horário</h2>
        <p className="text-gray-500 text-sm">Realce sua beleza com Rayane Figueira</p>
      </div>

      <Card className="mb-6 mx-2 shadow-lg shadow-rose-100">
        <Input 
          label="Escolha a data" 
          type="date" 
          value={dataSelecionada} 
          min={getHoje()} 
          onChange={(e) => setDataSelecionada(e.target.value)} 
        />
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">
            Horários Disponíveis
          </label>
          <div className="grid grid-cols-3 gap-2">
            {HORARIOS_DISPONIVEIS.map(h => {
              const estaOcupado = horariosOcupados.includes(h);
              const estaSelecionado = horarioSelecionado === h;

              return (
                <button
                  key={h} 
                  disabled={estaOcupado || loading}
                  onClick={() => setHorarioSelecionado(h)}
                  className={`py-3 rounded-lg text-sm font-medium transition-all 
                    ${estaOcupado 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : estaSelecionado 
                        ? 'bg-rose-500 text-white scale-105 shadow-md' 
                        : 'bg-white border border-rose-200 text-rose-900 hover:bg-rose-50'
                    }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        {horarioSelecionado && (
          <div className="space-y-4 pt-2 border-t border-rose-50 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">Serviço</label>
              <select 
                value={servico} 
                onChange={(e) => setServico(e.target.value)} 
                className="w-full px-4 py-3 border border-rose-200 rounded-lg bg-rose-50/30 text-gray-700 outline-none focus:ring-2 focus:ring-rose-300 transition-all"
              >
                <option value="">Selecione o serviço...</option>
                {SERVICOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <Input 
              label="Seu Nome Completo" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Digite seu nome"
            />

            <Button onClick={handleAgendar} disabled={loading} className="w-full">
              {loading ? 'Processando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        )}

        {feedback.msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center animate-bounce ${
            feedback.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.msg}
          </div>
        )}
      </Card>

      <button 
        onClick={onNavigateAdmin} 
        className="text-sm text-rose-300 hover:text-rose-500 flex items-center justify-center gap-2 mx-auto p-4 transition-colors"
      >
        <Lock size={14} /> Área da Profissional
      </button>
    </div>
  );
};

export default ClientView;