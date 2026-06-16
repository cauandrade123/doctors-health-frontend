import Header from "../../components/header/header";
import './index.scss'
import React, { useState, useEffect, useRef } from 'react';
import Telefone from '../../assets/img/tcc/tccassests/simbolos/Phone call.svg'
import Email from '../../assets/img/tcc/tccassests/simbolos/Emailicon.svg'
import LocIcon from '../../assets/img/tcc/tccassests/simbolos/LocIcon.svg'
import Mapa from '../../assets/img/tcc/tccassests/simbolos/MapImage.svg'
import Footer from "../../components/footer/footer";
import InputMask from 'react-input-mask';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Notification from "../../components/aviso/aviso";
import { Link } from "react-router-dom";
import Cardconfirmação from '../../components/confirmacao/confirmacao'
import CardNegacação from '../../components/negacao/negacao'
import CardCarregamento from '../../components/carregando/carregando'
import MapComponent from "../../components/MapComponent";
import { api } from "../../servicos";
import axios from "axios";





export default function Auto_cadastro() {

    const validarMaiorDe18 = (dataNascimento) => {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }


        return idade >= 18;
    };




    const verificarTelefone = async (telefone) => {
        const novo = telefone.replace(/\D/g, '')
        console.log(novo)

        if (novo.length < 10 || novo.length > 11) {
            return false;
        }
       
            const url = `https://api.veriphone.io/v2/verify?phone=55${novo}&key=2054E5F5B84C4794BF5E1C458782559F`;
            const response = await axios.get(url);
            console.log(response.data.phone_valid);
            return response.data.phone_valid; 
    };


    
  const verificarEmail = async (email) => {
    try {
        const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=72167d43207c27e6691b19ab0bbd3a2699b9250d`;
        const response = await axios.get(url)

        return response.data.data.status;
    } catch (error) {
        console.error('Erro ao verificar email (rate limit ou outro erro):', error);
        return "valid";
    }
};
    
    
    const FecharConfirmação = () => {
        setConfirmacao(false);
        navigate('/#secao-1');
    };

        
    const FecharNegação = () => {
        setNegacao(false);
      
    };
    
    
    

    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [nome, setNome] = useState();
    const [telefone, setTelefone] = useState();
    const [consultas, setConsultas] = useState();
    const [DTnascimento, setNascimento] = useState();
    const [cpf, setCpf] = useState();
    const [rg, setRg] = useState();
    const [horario, setHorario] = useState();
    const [data, setData] = useState();
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('')
    const [email, setEmail] = useState('')
    const [mostrarConfirmacao, setConfirmacao] = useState(false);
    const [mostrarNegacao, setNegacao] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState(''); 
    
    



    const cadastrarAgenda = async (data, horario) => {
        const url = '/agenda';
        const info = {
            "dia": data,
            "hora": horario
        };

        const response = await api.post(url, info);
        return response.data.agendaId;
    };

    const EnviarEmail = async (nome, data, horario, email) => {
        const url = '/enviar';
        const info = {
            "nome": nome,
            "email": email,
            "data": data,
            "horario": horario
        };

        const response = await api.post(url, info);
        return response.data.agendaId;
    };

    const criarAutoCadastro = async (nome, DTnascimento, rg, cpf, telefone, email) => {
        const tudo = {
            "nome": nome,
            "nascimento": DTnascimento,
            "rg": rg,
            "cpf": cpf,
            "telefone": telefone,
            "email": email
        };

        const url = '/autocadastro';
        const resp = await api.post(url, tudo);

        localStorage.setItem('token', resp.data.token)

        console.log('token armazenado')
        
        return resp.data.pacienteId;
        

    };

    const cadastrarConsulta = async (agendaId, pacienteId, consulta) => {
        const con = {
            "id_agenda": agendaId,
            "tratamento": "",
            "condicao": "",
            "medicao": "",
            "preco": "0",
            "id_paciente": pacienteId,
            "metodo": consulta
        };

        const url2 = '/consultas';
        const resp2 = await api.post(url2, con);
        return resp2.data;
    };

    const verificarpaciente = async (cpf) => {
        const url = '/verificar-cpf';
        const response = await api.post(url, { cpf });
        return response.data;
    };

    const TelefoneExiste = async (telefone) => {
        const url = '/verificar-telefone';
        const response = await api.post(url, { telefone });
        return response.data;
    };


    const verificarCpf = (cpf) => {
        const cpfLimpo = cpf.replace(/\D/g, '');


        if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
            return false;
        }


        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpfLimpo[i]) * (10 - i);
        }
        let primeiroDigito = (soma * 10) % 11;
        if (primeiroDigito === 10 || primeiroDigito === 11) {
            primeiroDigito = 0;
        }

        if (parseInt(cpfLimpo[9]) !== primeiroDigito) {
            return false;
        }


        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpfLimpo[i]) * (11 - i);
        }
        let segundoDigito = (soma * 10) % 11;
        if (segundoDigito === 10 || segundoDigito === 11) {
            segundoDigito = 0;
        }

        if (parseInt(cpfLimpo[10]) !== segundoDigito) {
            return false;
        }


        return true;
    };
    const obterHorariosOcupados = async (data) => {


     
        try {
            const response = await api.post('/horarios-ocupados', { data });
            const horarios = response.data.horariosOcupados;

            console.log('Horários recebidos:', horarios);



            const horariosOcupados = response.data.horariosOcupados[0].map(item => item.hora.slice(0, 5));
            if(horarios.length == 0) {
                setHorariosOcupados('');

            } else{
                setHorariosOcupados(horariosOcupados);
            }

        } catch (error) {
            console.error('Erro ao obter horários ocupados:', error);
        }

    };


    const IndetificarData = (e) => {
        const selecionarData = e.target.value;
        setData(selecionarData);
        setHorariosOcupados([]);
        obterHorariosOcupados(selecionarData);
    };

    const horariosDisponiveis = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    const navigate = useNavigate();




    const cadastrarTudo = async (nome, telefone, consulta, DTnascimento, rg, cpf, data, horario, email) => {
        if (carregando) return; 
        setCarregando(true)
        
    
        if (!nome || !telefone || !consulta || !DTnascimento || !rg || !cpf || !data || !horario || !email) {
            setMensagem('Por favor, preencha todos os campos obrigatórios.');
            setCarregando(false);
            setNegacao(true)

            return;
        }
    
      
        console.log('Verificando se o paciente já está cadastrado...');
        const pacienteExistente = await verificarpaciente(cpf);

        if (pacienteExistente.existe) {
            console.log('Paciente já cadastrado:', pacienteExistente);
            setMensagem('O paciente já está cadastrado no sistema.');
            setCarregando(false);
            setNegacao(true)

            return
        }
        const cpfValido = verificarCpf(cpf);
        if (!cpfValido) {
            setMensagem('CPF inválido. Por favor, verifique e tente novamente.');
            setCarregando(false);
            setNegacao(true)

            return;
        }

        console.log('Verificando se o telefone já está cadastrado...');
        const TelefoneExistente = await TelefoneExiste(telefone);

        if (TelefoneExistente.existe) {
            console.log('O telefone já cadastrado:', TelefoneExistente);
            setMensagem('O seu telefone já está cadastrado no sistema.');
            setCarregando(false);
            setNegacao(true)

            return
        }
    
        const validarIdade = validarMaiorDe18(DTnascimento);
        if (!validarIdade) {
            setMensagem('Você precisa ter 18 anos ou mais.');
            setCarregando(false);
            setNegacao(true)

            return;
        }
        
         const hoje = new Date();
         const dataConsulta = new Date(data);
         if (dataConsulta.setHours(0, 0, 0, 0) < hoje.setHours(0, 0, 0, 0)) {
            setMensagem('A data da consulta não pode ser uma data passada.');
             setCarregando(false);
            setNegacao(true)

             return;
         }
     
    

        const validarNumero = await verificarTelefone(telefone);
        console.log(validarNumero)
        if (!validarNumero) {
            setMensagem('Verifique seu telefone e tente novamente.');
            setCarregando(false);
            setNegacao(true)

            return;
        }

        const validarEmail = await verificarEmail(email);
        console.log(validarEmail)
        if (validarEmail != "valid") {
            setMensagem('Email inválido. Por favor, verifique e tente novamente.');
            setCarregando(false);
            setNegacao(true)

            return;
        }
    
    
        try {
           
                console.log('Cadastrando agenda...');
                const agendaId = await cadastrarAgenda(data, horario);
    
                console.log('Agenda cadastrada com ID:', agendaId);
    
                const pacienteId = await criarAutoCadastro(nome, DTnascimento, rg, cpf, telefone, email);
    
                console.log('Cadastrando consulta...');
                const consultaData = await cadastrarConsulta(agendaId, pacienteId, consulta);
                console.log('Consulta cadastrada:', consultaData);
                
                const enviarEmail = await EnviarEmail(nome, data, horario, email);
                setMensagem('Agendamento concluido')
                setCarregando(false);
                setConfirmacao(true);
                navigate('/')
    
           
            
    
        } catch (error) {
            
            console.error('Erro ao cadastrar:', error);
            setMensagem('Erro ao cadastrar. Tente novamente.');
            setCarregando(false);
                setNegacao(true);
        } 
    };




    const closeNotification = () => {
        setNotificationMessage('');
    };


    const clique = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            cadastrarTudo()
        }
    }



    return (
        <div className="main">



            <Header />

            <Notification
                message={notificationMessage}
                onClose={closeNotification}
                duration={3000}
                type={notificationType}
            />

            <h1 className="h1-title-container-box">Seja bem-vindo(a), realize seu cadastro!</h1>
            <div className="container-box">

                <div className="container-box-geral">

                    <h1 className="h1-title-container-box-inputs">Agende sua consulta.</h1>

                    <div className="container-box-inputs">

                        <div className="input-style">
                            <p>Nome</p>
                            <input onKeyDown={clique}  onChange={e => setNome(e.target.value)} type="text" placeholder="Digite aqui" />
                        </div>

                        <div className="input-style">
                            <p>Número de telefone</p>
                            <InputMask mask="(99) 99999-9999" type="text" onKeyDown={clique} placeholder="Digite aqui" onChange={e => setTelefone(e.target.value)} />
                        </div>

                        <div className="input-style">
                            <p>Método de Consulta</p>
                            <select className="metodoConsulta" onChange={e => setConsultas(e.target.value)}>
                                <option value="">Selecione</option>
                                <option value="Online ">Online</option>
                                <option value="Presencial">Presencial</option>
                            </select>
                        </div>

                        <div className="input-style">
                            <p>Data de nascimento</p>
                            <input onChange={e => setNascimento(e.target.value)} onKeyDown={clique} type="date" placeholder="Digite aqui" />
                        </div>

                        <div className="input-style">
                            <p>RG</p>
                            <InputMask
                             mask="99.999.999-9" onChange={e => setRg(e.target.value)} onKeyDown={clique} type="text" placeholder="Digite aqui: " />
                        </div>

                        <div className="input-style">
                            <p>CPF</p>
                            <InputMask
                             mask="999.999.999-99" onChange={e => setCpf(e.target.value)} onKeyDown={clique} type="text" placeholder="Digite aqui: XXX.XXX.XXX-XX" />
                        </div>

                        <div className="input-style">
                            <p>Selecione a data desejada para a consulta</p>
                            <input onChange={IndetificarData} onKeyDown={clique} type="date" />
                        </div>


                        <div className="input-style">
                            <p>Horário</p>
                            <select className="horario-select" onChange={e => setHorario(e.target.value)} value={horario}>
                                <option value="">Selecione o horário</option>
                                {horariosDisponiveis.map(h => (
                                    <option
                                        key={h}
                                        value={h}
                                        className={horariosOcupados.includes(h) ? 'horario-ocupado' : 'horario-disponivel'}
                                        disabled={horariosOcupados.includes(h)}
                                    >
                                        {h}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="input-style">
                            <p>Email</p>
                            <input onKeyDown={clique} onChange={e => setEmail(e.target.value)} type="text" placeholder="Digite aqui seu email" />
                        </div>



                    </div>

                                    {carregando? <CardCarregamento mostrar={carregando}/>:

                                        <div className="container-box-txt-button">

                        <div className="txt-hr">
                            <p>Em caso de cancelamento ou troca de horário entrar em contato por telefone!   </p>

                            <Link to={'/cadastrado'}>Se você já possui cadastro, clique aqui.</Link>
                        </div>

                        {<button className="bt-enviar" onClick={() => cadastrarTudo(nome, telefone, consultas, DTnascimento, rg, cpf, data, horario, email)}>Enviar</button>}

                        <Cardconfirmação mostrar={mostrarConfirmacao} aoFechar={FecharConfirmação} />
                        <CardNegacação mostrar={mostrarNegacao} aoFechar={FecharNegação} mensagem={mensagem}/>
                        



                    </div>

}
                </div>


            </div>


            <div className="container-box2">
                <h1>Nos Encontre Por Aqui</h1>

                <div className="container-box-cards">
                    <div className="card-box-tel">

                        <img src={Telefone} alt="" />

                        <div className="txt-card">
                            <h4>Telefone</h4>
                            <p>(11) 98125-6503</p>
                        </div>

                    </div>
                    <div className="card-box-email">

                        <img className="Emailicon" src={Email} alt="" />

                        <div className="txt-card">
                            <h4>Email</h4>
                            <p>drjoaosilva@gmail.com.br</p>
                        </div>

                    </div>
                    <div className="card-box-loc">

                        <img src={LocIcon} alt="" />

                        <div className="txt-card">
                            <h4>Endereço</h4>
                            <p>Rua Astolfo Vila, 389.</p>
                        </div>

                    </div>


                </div>

                <div className="container-box-local">

                   <MapComponent />

                </div>

            </div>

            <footer><Footer /></footer>
        </div>


    )
};