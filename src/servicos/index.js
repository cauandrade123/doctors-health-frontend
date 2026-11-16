import axios from "axios";

// Endereço da API definido no build (REACT_APP_API_URL). Em produção deve ser HTTPS:
// o token de sessão vai em toda requisição. O valor padrão é o servidor atual.
export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://100.49.188.239:3000"
})

// Envia em toda chamada à API o token salvo no login (painel) ou no autocadastro (paciente).
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const TELAS_PROTEGIDAS = ['/adm', '/reuniao'];

// Sessão do painel inválida ou expirada: descarta o token e volta para o login.
api.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
        const emTelaProtegida = TELAS_PROTEGIDAS.some((tela) => window.location.pathname.startsWith(tela));
        if (erro.response?.status === 401 && emTelaProtegida) {
            localStorage.removeItem('token');
            window.location.assign('/login');
        }
        return Promise.reject(erro);
    }
);
