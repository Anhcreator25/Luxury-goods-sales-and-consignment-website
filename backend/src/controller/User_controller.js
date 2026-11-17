import { 
    registerServices, 
    loginServices,
    getUserBankAccountsService,
    addBankAccountService,
    deleteBankAccountService,
    setDefaultBankAccountService
} from "../services/User_services.js";

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

// Fetch linked bank accounts for authenticated user
export const getBankAccountsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const accounts = await getUserBankAccountsService(userId);
        res.status(200).json({
            success: true,
            data: accounts
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi lấy thông tin tài khoản ngân hàng'
        });
    }
};

// Link a new bank account for authenticated user
export const addBankAccountController = async (req, res) => {
    try {
        const userId = req.user.id;
        const newAccount = await addBankAccountService(userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Thêm tài khoản ngân hàng thành công',
            data: newAccount
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi khi thêm tài khoản ngân hàng'
        });
    }
};

// Delete a linked bank account by ID
export const deleteBankAccountController = async (req, res) => {
    try {
        const userId = req.user.id;
        const accountId = req.params.id;
        const result = await deleteBankAccountService(userId, accountId);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi khi xóa tài khoản ngân hàng'
        });
    }
};

// Set a bank account as default by ID
export const setDefaultBankAccountController = async (req, res) => {
    try {
        const userId = req.user.id;
        const accountId = req.params.id;
        const result = await setDefaultBankAccountService(userId, accountId);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Lỗi khi đổi tài khoản mặc định'
        });
    }
};
