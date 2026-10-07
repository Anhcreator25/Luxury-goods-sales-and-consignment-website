import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const registerServices = async (userData) => {
    const { name, email, password, phone, role } = userData;

    
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        throw { status: 400, message: "This email existed !" };
    }

  
    const hashPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'buyer';

    const insertQuery = 'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(insertQuery, [name, email, hashPassword, phone, userRole]);

    return { userId: result.insertId };
};

export const loginServices = async (infor) => {
    const { email, password } = infor;

  
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
        throw { status: 404, message: 'email not exist in the system' };
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { status: 400, message: 'password incorrect' };
    }

   
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
    };
};