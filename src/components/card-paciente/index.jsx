import './index.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../aviso/aviso';


import ConsultasPDF from '../gerar-pdf';
import SimboloPDF from '../../assets/img/tcc/tccassests/simbolos/simbolPdf.png'
import SimboloCamera from '../../assets/img/tcc/tccassests/simbolos/simbolCamera.png'
import { api } from '../../servicos';

export default function Card_Paciente({ id, condicao, cpf, dia_horario, horario, medicacao, nascimento, nome, preco, rg, tratamento, finalizada, email , metodo_consulta}) {

    const [editarMode, setEditarMode] = useState(false);
    const [sair, setSair] = useState(false);
    const [terminada, setTerminada] = useState(false);
    const [finalizada2, setFinalizada2] = useState(finalizada);
    const [bt, setBotao] = useState('');
    let [linkConsulta, setlinkConsulta] = useState('');

    setlinkConsulta = localStorage.getItem('link');

    const [novoTratamento, setNovoTratamento] = useState('');
    const [novaCondicao, setNovaCondicao] = useState('');
    const [novaMedicacao, setNovaMedicacao] = useState('');
    const [novoPreco, setNovoPreco] = useState('');
    const [novaFinalizada, setNovaFinalizada] = useState(finalizada2);
    const [finalizadaFinal, setfinalizadaFinal] = useState('');

    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('');

    const closeNotification = () => {
        setNotificationMessage('');
    };

    async function enviarEmail() {

        const comando = {
            "nome": nome,
            "link": `https://meet.jit.si/SALA%20DE%20${nome}`, 
            "email": email
        }
        const url = `/enviar-call`;
        await api.post(url,comando);}

    const navigate = useNavigate();

    // Abre a edição com os valores atuais: campos não alterados são reenviados como estão,
    // em vez de vazios (preço vazio era recusado e apagava os outros dados).
    const edit = () => {
        setNovoTratamento(tratamento ?? '');
        setNovaCondicao(condicao ?? '');
        setNovaMedicacao(medicacao ?? '');
        setNovoPreco(preco ?? '');
        setEditarMode(true);
    };
    
    function combinada() {
        NavegarParaReuniao();
        
        setTimeout(() => {
            
            enviarEmail();
            localStorage.removeItem('link');
            
        }, 30000); 
    }



    function NavegarParaReuniao (){
        const params = { nome }
        
        navigate('/reuniao', {state: {nome}}) 
    }

    const salvar = async () => {

        try {

            const url = `/consultas/${id}`;
            const payload = {
                "tratamento": novoTratamento,
                "condicao": novaCondicao,
                "medicacao": novaMedicacao,
                "preco": novoPreco === '' ? null : novoPreco
            };
            const tal = await api.put(url, payload);
            setNotificationMessage('Dados atualizados com sucesso!');
            setNotificationType('sucess');
        } catch (error) {
            alert(error)
            setNotificationMessage('Erro ao atualizar os dados!');
            setNotificationType('error');
        }

        setTimeout(function () {
            window.location.reload();
        }, 1000);
        setEditarMode(false);
    };

    const mudar = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setNovaFinalizada(checked ? 'sim' : "não");
        } else {
            if (name === 'tratamento') setNovoTratamento(value);
            if (name === 'condicao') setNovaCondicao(value);
            if (name === 'medicacao') setNovaMedicacao(value);
            if (name === 'preco') setNovoPreco(value);
        }
    };

    function setBt() {
        if (finalizada === 'Não') {
            setBotao(<button className='editar' onClick={Finalizar}>Finalizar</button>);
        } else {
            setBotao('');
        }
    }

    async function Finalizar() {
        const url = `/finalizarConsulta/${cpf}`;
        await api.put(url);


        setNotificationMessage('Consulta finalizada com sucesso!');
        setNotificationType('sucess');

        setTimeout(function () {
            window.location.reload();
        }, 1000);
    }

    async function verificarEstadoFinalizada() {
        const url2 = `/consultaFinalizar/${cpf}`;
        let resp2 = await api.get(url2);
        setFinalizada2(resp2.data.finalizada);
    }

    useEffect(() => {
        verificarEstadoFinalizada();
        setBt();
    }, [finalizada2, cpf]);

    return (
        <div className="card1">
            <Notification
                message={notificationMessage}
                onClose={closeNotification}
                duration={4000}
                type={notificationType}
            />

            <div className="dados-cliente">
                <h1>Data: {dia_horario} / Horário: {horario}</h1>
                <hr />
                <div className="field">
                    <h2>Nome: <p>{nome}</p></h2>
                </div>
                <div className="field">
                    <h2>RG: <p>{rg}</p></h2>
                </div>
                <div className="field">
                    <h2>Informações sobre o paciente: <p>{nascimento}</p></h2>
                </div>
                <div className="field">
                    <h2>CPF: <p>{cpf}</p></h2>
                </div>
                <div className="field">
                    <h2>Metodo de consulta: <p>{metodo_consulta}</p></h2>
                </div>
                <div className="field">
                    <h2>Email: <p>{email}</p></h2>
                </div>
                <div className="field">
                    <h2>Tratamento: {editarMode ? (
                        <input
                            type="text"
                            name="tratamento"
                            value={novoTratamento}
                            onChange={mudar}
                        />
                    ) : (
                        <p>{tratamento}</p>
                    )}</h2>
                </div>
                <div className="field">
                    <h2>Condição: {editarMode ? (
                        <input
                            type="text"
                            name="condicao"
                            value={novaCondicao}
                            onChange={mudar}
                        />
                    ) : (
                        <p>{condicao}</p>
                    )}</h2>
                </div>
                <div className="field">
                    <h2>Medicação: {editarMode ? (
                        <input
                            type="text"
                            name="medicacao"
                            value={novaMedicacao}
                            onChange={mudar}
                        />
                    ) : (
                        <p>{medicacao}</p>
                    )}</h2>
                </div>
                <div className="field">
                    <h2>Preço: {editarMode ? (
                        <input
                            type="number"
                            name="preco"
                            value={novoPreco}
                            onChange={mudar}
                        />
                    ) : (
                        <p>R${preco}</p>
                    )}</h2>
                </div>
                <div className="field">
                    <h2>Finalizada:
                        <p>{finalizada}</p>
                    </h2>
                </div>
            </div>

            <footer>

            <div className="container-buttons">
                {editarMode ? (
                    <button className="editar" onClick={salvar}>Salvar</button>
                ) : (
                    <button className="editar" onClick={edit}>Editar</button>
                )}

                <button className='bt-gerarPdf' onClick={() => ConsultasPDF({
                    nome,
                    cpf,
                    tratamento,
                    condicao,
                    medicacao,
                    preco,
                    dia_horario,
                    horario
                })}>
                    <img className='simbolPdf' src={SimboloPDF} alt="" />
                </button>

                <button onClick={combinada} className='meet'>
                    <img className='simbolMeet' src={SimboloCamera} alt="" />
                </button>


                {bt}
            </div>
                    </footer>
        </div>
    );
}




