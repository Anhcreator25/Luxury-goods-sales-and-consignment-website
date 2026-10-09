import axiosClient from "./axiosClient";


export const authServices = {
    
    // call login API
    login: async (credentials) => {
        return await axiosClient.post('/user/login',credentials);
    },
    
    // call register API
    register: async (userData) => {
        return await axiosClient.post('/user/register',userData);
    }
}