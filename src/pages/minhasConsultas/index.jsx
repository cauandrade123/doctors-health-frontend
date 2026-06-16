import './index.scss';
import Header from '../../components/header/header';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '../../servicos';

export default function MinhasConsultas() {
    const [minhasConsultas, setMinhasConsultas] = useState([]);
   

    useEffect(() => {

      


        async function Consultas() {
            let url = `/MinhasConsultas`;

            try {

                const token = localStorage.getItem('token'); 
             
                const resp = await api.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                localStorage.setItem('minhasConsultas', JSON.stringify(resp.data))
                setMinhasConsultas(resp.data);

            } catch (error) {
                console.error("Erro ao buscar consultas:", error.response?.data || error.message);
            }
        };


        const storedConsultas = localStorage.getItem('minhasConsultas');
        if (storedConsultas) {
            setMinhasConsultas(JSON.parse(storedConsultas));
        }
    
        Consultas();
    }, []);

    return (
        <div className='minhas-consultas-page'>
         <Header />
            <h1>Minhas Consultas</h1>
            <div className="content">

                <div className="consultas-container">
                    <div className="cabecalho">
                        <h2>Data e Hora</h2>
                    </div>
                    <div className="dados">
                        {minhasConsultas.length > 0 ? (
                            minhasConsultas.map((consulta, index) => (
                                <div className="consulta" key={index}>
                                    <h3>{new Date(consulta.dia_horario).toLocaleString()}</h3>
                                </div>
                            ))
                        ) : (
                            <p>Nenhuma consulta encontrada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
