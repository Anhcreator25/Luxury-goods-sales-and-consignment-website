import axiosClient from "./axiosClient";

export const loginApi = async (credential)=>{
    return await axiosClient.post('/users/login',credential);

}
export const registerApi = async (userData) => {
    return await axiosClient.post('/users/register',userData);
}