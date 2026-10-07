import jwt from 'jsonwebtoken'


export const verifyToken =(req,res,next)=>{
    const authHeader =req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            sucess: false,
            message: 'truy cập bị từ chối , ko tìm thấy token xác nhận'
        });
    }
    const token =authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRECT);

         req.user = decoded;

         next();
    }catch(error){
        return res.status(403).json({
            sucess: false,
            message: 'Token không hợp lệ hoặc hết hạn'
        })
    }
}

export const verifyRole =(allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: 'chưa xác thực thông tin người dùng'
            });
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "bạn không có quyền thực hiện hành động này"
            });
        }
        next();
    }
}