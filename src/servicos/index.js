import axios from "axios";

export const api = axios.create({
    baseURL: "ec2-100-49-188-239.compute-1.amazonaws.com/"
})