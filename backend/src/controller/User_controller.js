import { registerServices,loginServices } from "../services/User_services.js";

export const registerController = async(req,res)=>{
    try {
        const {name,email,password,phone}=req.body;
        if(!name||!email||!password||!phone){
            return res.status(400).json({sucess: false ,message:'please enter full information'})
        }

        const data= await registerServices(req.body);
        res.status(200).json({
            sucess: true,
            message: ' regiser sucessful !',
            token: data.token,
            user: data.user
        })
    } catch (error) {
            res.status(error.status||500).json({
            sucess: false,
            message: error.message ||' Error server!',
            error: error.error || null
            })
    }
}

export const loginController = async(req,res)=>{
   try {
         const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter email and password!' });
         }
             const data = await loginServices(req.body);

        res.status(200).json({
            success: true,
            message: 'Login Succesful !',
            token: data.token,
            user: data.user });
       
   } catch (error) {
      
        res.status(error.status||500).json({
            sucess: false,
            message: error.message ||' Error server!',
            error: error.error || null
            })
    
   }

   
}
