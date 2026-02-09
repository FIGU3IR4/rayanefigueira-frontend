import React, { useState, useEffect } from 'react';
import { Lock, CreditCard, MessageCircle, Copy, Check } from 'lucide-react'; 
import pix from '../../assets/pix.png'; 

// Import de Serviços
import { agendamentoService } from '../../services/api';

// Import de Componentes de UI
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

// Import de Utilitários e Constantes
import { getHoje } from '../../utils/dateUtils';
import { HORARIOS_DISPONIVEIS, SERVICOS } from '../../constants/config';

const QR_CODE_PIX_URL = pix;
const WHATSAPP_NUMBER = '5581995920432'; 
const CHAVE_PIX = 'jessicarayane.tpc@gmail.com'; 

const ClientView = ({ onNavigateAdmin }) => {
  const [dataSelecionada, setDataSelecionada] = useState(getHoje());
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState('');
  const [nome, setNome] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [showPixModal, setShowPixModal] = useState(false);
  const [valorMetadeServico, setValorMetadeServico] = useState(0);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    carregarHorarios();
  }, [dataSelecionada]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    setNumeroCliente(value);
  };

  const carregarHorarios = async () => {
    setLoading(true);
    try {
      const response = await agendamentoService.listar(dataSelecionada);
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

  const handleVerificarPagamento = () => {
    if (!nome || !horarioSelecionado || !servicoSelecionado || !numeroCliente) {
      return alert("Preencha todos os campos antes de continuar.");
    }
    const servicoDetalhes = SERVICOS.find(s => s.nome === servicoSelecionado);
    if (servicoDetalhes) {
      const precoNumerico = parseFloat(servicoDetalhes.preco.replace("R$", "").replace(".", "").replace(",", ".").trim());
      const metade = precoNumerico / 2;
      setValorMetadeServico(metade);
      setShowPixModal(true);
    } else {
      alert("Serviço não encontrado.");
    }
  };

  const handleFinalizarAgendamento = async () => {
    setLoading(true);
    try {
      await agendamentoService.criar({ 
        nome, 
        numeroCliente: numeroCliente, 
        data: dataSelecionada, 
        horario: horarioSelecionado, 
        servico: servicoSelecionado,
        valorPix: valorMetadeServico.toFixed(2),
        statusPagamento: 'AGUARDANDO_COMPROVANTE'
      });
      
      const mensagemWhatsapp = `Olá Rayane! Agendei ${servicoSelecionado} para o dia ${dataSelecionada} às ${horarioSelecionado}. Nome: ${nome}. Segue o comprovante do sinal de R$ ${valorMetadeServico.toFixed(2)}.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`, '_blank');

      setFeedback({ type: 'success', msg: 'Agendamento registrado! Enviando para o WhatsApp...' });
      
      setNome(''); 
      setNumeroCliente('');
      setServicoSelecionado(''); 
      setHorarioSelecionado(null);
      setShowPixModal(false);
      carregarHorarios();
    } catch (error) { 
      setFeedback({ type: 'error', msg: 'Erro ao agendar. Tente novamente.' }); 
    } finally { 
      setLoading(false); 
      setTimeout(() => setFeedback({ type: '', msg: '' }), 7000); 
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pb-10 min-h-screen bg-neutral-950 text-neutral-100">
      <div className="text-center py-8 px-4">
        <h2 className="text-3xl font-serif text-white mb-2 tracking-wide">Agende seu Horário</h2>
        <p className="text-neutral-500 text-sm uppercase tracking-widest">Rayane Figueira | Lash Designer</p>
      </div>

      <Card className="mb-6 mx-2 bg-neutral-900 border-neutral-800 shadow-2xl">
        <div className="p-1">
          <Input 
            label="Escolha a data" 
            type="date" 
            value={dataSelecionada} 
            min={getHoje()} 
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white focus:ring-neutral-600"
          />
        </div>
        
        <div className="mb-6 mt-4 px-1">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 ml-1">
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
                  className={`py-3 rounded-lg text-sm font-medium transition-all duration-300
                    ${estaOcupado 
                      ? 'bg-neutral-800/50 text-neutral-600 cursor-not-allowed border border-transparent' 
                      : estaSelecionado 
                        ? 'bg-white text-black scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                        : 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700'
                    }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        {horarioSelecionado && (
          <div className="space-y-4 pt-4 border-t border-neutral-800 animate-in fade-in slide-in-from-top-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase mb-2 ml-1">Serviço</label>
              <select 
                value={servicoSelecionado} 
                onChange={(e) => setServicoSelecionado(e.target.value)} 
                className="w-full px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-600 transition-all appearance-none"
              >
                <option value="" className="bg-neutral-900">Selecione o serviço...</option>
                {SERVICOS.map((s) => (
                  <option key={s.nome} value={s.nome} className="bg-neutral-900">
                    {s.nome} — {s.preco}
                  </option>
                ))}
              </select>
            </div>

            <Input 
              label="Seu Nome Completo" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Digite seu nome"
              className="bg-neutral-800 border-neutral-700 text-white"
            />

            <Input 
              label="Número de Telefone" 
              value={numeroCliente} 
              onChange={handlePhoneChange} 
              placeholder="(00) 00000-0000"
              type="tel"
              className="bg-neutral-800 border-neutral-700 text-white"
            />

            <Button 
              onClick={handleVerificarPagamento} 
              disabled={loading} 
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-4 rounded-xl transition-all"
            >
              <CreditCard size={20} className="mr-2 inline" /> {loading ? 'Carregando...' : 'Pagar Reserva (50%)'}
            </Button>
          </div>
        )}

        {feedback.msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center border ${
            feedback.type === 'success' 
              ? 'bg-green-900/20 text-green-400 border-green-800' 
              : 'bg-red-900/20 text-red-400 border-red-800'
          }`}>
            {feedback.msg}
          </div>
        )}
      </Card>

      {showPixModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-xs w-full p-6 text-center shadow-2xl bg-neutral-900 border-neutral-800">
            <h3 className="text-xl font-serif text-white mb-4">Pagamento PIX</h3>
            <p className="text-2xl font-bold text-white mb-2">R$ {valorMetadeServico.toFixed(2).replace('.', ',')}</p>
            
            <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-lg">
              <img 
                src={QR_CODE_PIX_URL} 
                alt="QR Code" 
                className="w-40 h-40 mx-auto"
              />
            </div>

            <div className="mb-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Chave PIX (E-mail)</p>
              <div 
                onClick={handleCopyPix}
                className="flex items-center justify-between gap-2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
              >
                <span className="text-[10px] text-neutral-300 truncate font-mono">
                  {CHAVE_PIX}
                </span>
                {copiado ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-neutral-500" />}
              </div>
              {copiado && <span className="text-[10px] text-green-500 font-bold mt-2 block">Copiado com sucesso!</span>}
            </div>
            
            <Button 
              onClick={handleFinalizarAgendamento} 
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-4 rounded-xl"
            >
              <MessageCircle size={20} /> Confirmar no WhatsApp
            </Button>
            
            <button 
              onClick={() => setShowPixModal(false)} 
              className="mt-6 text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Voltar ao agendamento
            </button>
          </Card>
        </div>
      )}

      <button 
        onClick={onNavigateAdmin} 
        className="text-xs text-neutral-600 hover:text-neutral-400 flex items-center justify-center gap-2 mx-auto p-8 transition-colors"
      >
        <Lock size={12} /> Acesso Restrito
      </button>
    </div>
  );
};

export default ClientView;