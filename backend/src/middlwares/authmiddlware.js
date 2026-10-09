import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'not found token !' });
        }


        jwt.verify(token, process.env.JWT_SECRECT, (err, decoded) => {
            if (err) {
                console.log("Error detail verify", err.message); 
                return res.status(403).json({
                    success: false,
                    message: 'Token is invalid and not exist!',
                    error: err.message
                });
            }

            req.user = decoded; 
            next();
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error server!' });
    }
};

export const verifyRole =(allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: 'User information not yet verified'
            });
        }
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "You don't have permission to perform this action."
            });
        }
        next();
    }
}