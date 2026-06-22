import axios from "axios";

export const api = axios.create({
    baseURL: "http://100.49.188.239:3000"
})