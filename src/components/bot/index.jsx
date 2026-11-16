import axios from "axios";
import { api } from "../../servicos";
import { useState } from "react";
import { Await, useNavigate } from "react-router-dom";

import './index.scss'


export default function Chat() {
    const [mensagem, setMensagem] = useState('');
    const [resposta, setResposta] = useState([]);
    const [carregando, setCarregando] = useState(false); 
    const navigate = useNavigate('');

    const mostrasmsg = async () => {
        if (!mensagem.trim()) {
            setResposta((prevResposta) => [
                ...prevResposta,
                { text: 'Por favor, insira uma mensagem válida.', sender: 'bot' }
            ]);
            return;
        }

        setResposta((prevResposta) => [...prevResposta, { text: mensagem, sender: 'user' }]);
        setMensagem("");
        setCarregando(true); 


        

        // A interpretação é feita pela API, que guarda a chave do serviço no servidor.
        const respotadobot = await api.post('/bot/interpretar', { mensagem }).catch(() => null);

        if (!respotadobot) {
            setResposta((prevResposta) => [
                ...prevResposta,
                { text: 'Não consegui responder agora. Tente novamente em instantes.', sender: 'bot' }
            ]);
            setCarregando(false);
            return;
        }

        let resp = respotadobot.data;

        const saudacao = resp.entities['saudacao:saudacao'] || [];

        const consulta = resp.entities['consulta:consulta'] || [];

        const xingamento = resp.entities['xingamento:xingamento'] || [];

        const cancelar = resp.entities['cancelamento:cancelamentos'] || [];

        const nome = resp.entities['saber:saber'] || [];

        const especialidade = resp.entities ['especialidade:especialidade'] || [];
        const numero = resp.entities ['numero:numero'] || [];
        const plano = resp.entities ['plano:plano'] || [];
        const pagamento =   resp.entities ['pagamento:pagamento'] || [];
        const doenca = resp.entities [  'doen_a:doen_a'] || [];





        const novasRespostas = [];

        


        if (pagamento.length > 0) {
             novasRespostas.push({ text: 'Aceitamos Dinheiro, pix e cartão'  , sender: 'bot' });

        }

          
        if (doenca.length > 0) {


            const responseUserTraducao = await axios.get(`https://api.mymemory.translated.net/get`, {
                params: {
                    q: doenca[0].value,
                    langpair: "pt|en" 
                }
            });

            const userTranslate = responseUserTraducao.data.responseData?.translatedText;

            
         
                const respostadoremedio = await axios.get(`https://api.fda.gov/drug/event.json`, {
                    params: {
                        search:userTranslate, 
                        limit: 5
                    }
                });
        
                const dadosMedicamento = respostadoremedio.data.results || [];
                if (dadosMedicamento.length > 0) {

                    const respostaMedicamentoArray = await Promise.all(

                        dadosMedicamento.map(async (dado) => {
                            const medicamento = dado.patient?.drug[0]?.medicinalproduct || 'não disponível';
        
                            const responseRemedioTraducao = await axios.get(`https://api.mymemory.translated.net/get`, {
                                params: {
                                    q: medicamento,
                                    langpair: "en|pt" 
                                }
                            });
        
                            const medicamentoTraduzido = responseRemedioTraducao.data.responseData?.translatedText;
                            const sla = medicamentoTraduzido.toLowerCase()
                            novasRespostas.push({ text: sla, sender: 'bot' });
                           
                        })
                    );
        
                 
                    novasRespostas.push({ text: "Quaisquer efeitos negativos não serão responsabilidade do doutor. Para um diagnóstico preciso, agende sua consulta.", sender: 'bot' });
                    novasRespostas.push({ text: 'Marque aqui -->    ', sender: 'button' });
                } else {
                    novasRespostas.push({ text: 'Não encontrei informações sobre medicamentos relacionados.', sender: 'bot' });
                }
           
        }
        
        if (plano.length > 0) {
            novasRespostas.push({ 
                text: `Gostaríamos de informar que, atualmente, o Dr.Joao silva não aceita nenhum plano de saúde. O pagamento das consultas e procedimentos deve ser realizado diretamente no ato do atendimento.`, 
                sender: 'bot' 
            });
        }
        

        if (numero.length > 0) {
            novasRespostas.push({ text: `O número de telefone é: 11999994613  `, sender: "bot"})
        }

        if (especialidade.length > 0) {

             novasRespostas.push({ text: `O Dr. João Silva, clínico geral com mais de 15 anos de experiência, é responsável por cuidar da saúde geral dos seus pacientes, oferecendo um atendimento abrangente e preventivo. Como clínico geral, ele é o primeiro ponto de contato para muitas condições de saúde e desempenha um papel essencial na detecção precoce de doenças, tratamento de enfermidades comuns e no encaminhamento para especialistas quando necessário.`, sender: "bot"})
        }

        if (saudacao.length > 0) {
            novasRespostas.push({ text: 'Olá! Como posso lhe ajudar hoje?', sender: "bot" });
        }

        if (nome.length > 0) {
            novasRespostas.push({ text: 'O nome do doutor é João Silva ' , sender: "bot" });

        }

        if (cancelar.length > 0) {
            novasRespostas.push({ text: 'Para cancelar uma consulta,ligue ou mande mensagem  para o número 8199999999', sender: "bot" });

        }
        if (consulta.length > 0) {
            novasRespostas.push({ text: 'Para marcar sua consulta, clique no botão abaixo:', sender: "bot" });
            novasRespostas.push({ text: 'Marque aqui -->', sender: 'button' });
        }
        if (xingamento.length > 0) {
            novasRespostas.push({ text: 'Esse tipo de mensagem não é tolerado.', sender: "bot" });
            navigate('/')
        }

        if (novasRespostas.length === 0) {
            novasRespostas.push({ text: 'Desculpe, não compreendo sua solicitação.', sender: "bot" });
        }
    

        setResposta((prevResposta) => [...prevResposta, ...novasRespostas]);
        setCarregando(false); 
    }

    const navegar = () => {
        navigate('/auto_cadastro');
    }

    const clique = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            mostrasmsg(); 
        }
    }
    return (
        <main className="bot">
            <div className="bot1">
                <ul>
                    {resposta.map((msg, index) => (
                        <li key={index} className={msg.sender}>
                            <strong>{msg.sender === 'user' ? 'Você' : 'Aquino'}:</strong> {msg.text}
                            {msg.sender === 'button' && (
                                <button className="clique" onClick={navegar}>Agendar</button>
                            )}      
                        </li>
                    ))}
                    {carregando && <li className="bot"><strong>Aquino:</strong> Estou pensando...</li>} {/* Indicador de carregamento */}
                </ul>

                <input
                    type="text"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    onKeyDown={clique}
                    placeholder="Digite sua mensagem"
                />
                <button className="enviar" onClick={mostrasmsg}>Enviar</button>
            </div>
        </main>
    );
}