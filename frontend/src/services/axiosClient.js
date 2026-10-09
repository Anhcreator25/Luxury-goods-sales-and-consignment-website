import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosClient.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;

        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (reponse)=>{
        return reponse.data;
    },
    (error)=>{
        return Promise.reject(error.reponse ? error.reponse.data : error.message)
    }
);

export default axiosClient;
