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
const CHAVE_PIX = 'jessicarayane.tpc@gmail.com'; // Sua chave definida

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
  const [copiado, setCopiado] = useState(false); // Estado para o feedback de cópia

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
                value={servicoSelecionado} 
                onChange={(e) => setServicoSelecionado(e.target.value)} 
                className="w-full px-4 py-3 border border-rose-200 rounded-lg bg-rose-50/30 text-gray-700 outline-none focus:ring-2 focus:ring-rose-300 transition-all"
              >
                <option value="">Selecione o serviço...</option>
                {SERVICOS.map((s) => (
                  <option key={s.nome} value={s.nome}>
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
            />

            <Input 
              label="Número de Telefone" 
              value={numeroCliente} 
              onChange={handlePhoneChange} 
              placeholder="(00) 00000-0000"
              type="tel"
            />

            <Button onClick={handleVerificarPagamento} disabled={loading} className="w-full">
              <CreditCard size={20} className="mr-2 inline" /> {loading ? 'Carregando...' : 'Pagar Reserva (50%)'}
            </Button>
          </div>
        )}

        {feedback.msg && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
            feedback.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.msg}
          </div>
        )}
      </Card>

      {showPixModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-xs w-full p-6 text-center shadow-2xl bg-white">
            <h3 className="text-xl font-serif text-rose-900 mb-4">Pagamento PIX</h3>
            <p className="text-lg font-bold text-rose-700 mb-2">Valor: R$ {valorMetadeServico.toFixed(2).replace('.', ',')}</p>
            
            <img 
              src={QR_CODE_PIX_URL} 
              alt="QR Code" 
              className="w-40 h-40 mx-auto mb-4 border p-2 rounded-lg"
            />

            {/* Seção Copia e Cola */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-1">Chave PIX (E-mail):</p>
              <div 
                onClick={handleCopyPix}
                className="flex items-center justify-between gap-2 p-2 bg-gray-50 border border-dashed border-rose-200 rounded cursor-pointer hover:bg-rose-50 transition-colors"
              >
                <span className="text-[10px] text-gray-600 truncate font-mono">
                  {CHAVE_PIX}
                </span>
                {copiado ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-rose-300" />}
              </div>
              {copiado && <span className="text-[10px] text-green-600 font-bold mt-1 block">Chave copiada!</span>}
            </div>
            
            <Button 
              onClick={handleFinalizarAgendamento} 
              className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} /> Já paguei, avisar no Whats
            </Button>
            
            <button 
              onClick={() => setShowPixModal(false)} 
              className="mt-4 text-xs text-gray-400 hover:underline"
            >
              Cancelar
            </button>
          </Card>
        </div>
      )}

      <button onClick={onNavigateAdmin} className="text-sm text-rose-300 flex items-center justify-center gap-2 mx-auto p-4">
        <Lock size={14} /> Área da Profissional
      </button>
    </div>
  );
};

export default ClientView;