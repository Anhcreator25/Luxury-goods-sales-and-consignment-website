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
        process.env.JWT_SECRET || process.env.JWT_SECRECT,
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

// Get all linked bank accounts for a user (default account first)
export const getUserBankAccountsService = async (userId) => {
    const [rows] = await pool.query(
        'SELECT id, user_id, bank_name, bank_account_number, bank_account_holder, is_default, created_at FROM user_bank_accounts WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
        [userId]
    );
    return rows;
};

// Link a new bank account and auto-set default if it's the first one
export const addBankAccountService = async (userId, data) => {
    const { bank_name, bank_account_number, bank_account_holder, is_default } = data;

    if (!bank_name || !bank_account_number || !bank_account_holder) {
        throw { status: 400, message: 'Vui lòng điền đầy đủ tên ngân hàng, số tài khoản và tên chủ thẻ.' };
    }

    const cleanBankName = bank_name.trim();
    const cleanAccountNum = bank_account_number.trim();
    const cleanHolder = bank_account_holder.trim().toUpperCase();

    // Check existing accounts to determine default status
    const [existing] = await pool.query(
        'SELECT id FROM user_bank_accounts WHERE user_id = ?',
        [userId]
    );

    const shouldBeDefault = existing.length === 0 ? 1 : (is_default ? 1 : 0);

    // Unset current default if new account is marked as default
    if (shouldBeDefault === 1) {
        await pool.query(
            'UPDATE user_bank_accounts SET is_default = 0 WHERE user_id = ?',
            [userId]
        );
    }

    const [result] = await pool.query(
        'INSERT INTO user_bank_accounts (user_id, bank_name, bank_account_number, bank_account_holder, is_default) VALUES (?, ?, ?, ?, ?)',
        [userId, cleanBankName, cleanAccountNum, cleanHolder, shouldBeDefault]
    );

    return {
        id: result.insertId,
        user_id: userId,
        bank_name: cleanBankName,
        bank_account_number: cleanAccountNum,
        bank_account_holder: cleanHolder,
        is_default: shouldBeDefault
    };
};

// Remove a bank account and auto-promote the next available one if needed
export const deleteBankAccountService = async (userId, accountId) => {
    const [check] = await pool.query(
        'SELECT id, is_default FROM user_bank_accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
    );

    if (check.length === 0) {
        throw { status: 404, message: 'Tài khoản ngân hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.' };
    }

    await pool.query(
        'DELETE FROM user_bank_accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
    );

    // Auto-promote latest account if default was removed
    if (check[0].is_default === 1) {
        const [remaining] = await pool.query(
            'SELECT id FROM user_bank_accounts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        if (remaining.length > 0) {
            await pool.query(
                'UPDATE user_bank_accounts SET is_default = 1 WHERE id = ?',
                [remaining[0].id]
            );
        }
    }

    return { success: true, message: 'Đã xóa tài khoản ngân hàng thành công.' };
};

// Set a specific bank account as default payout destination
export const setDefaultBankAccountService = async (userId, accountId) => {
    const [check] = await pool.query(
        'SELECT id FROM user_bank_accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
    );

    if (check.length === 0) {
        throw { status: 404, message: 'Tài khoản ngân hàng không tồn tại.' };
    }

    // Reset current default and apply new default
    await pool.query(
        'UPDATE user_bank_accounts SET is_default = 0 WHERE user_id = ?',
        [userId]
    );

    await pool.query(
        'UPDATE user_bank_accounts SET is_default = 1 WHERE id = ? AND user_id = ?',
        [accountId, userId]
    );

    return { success: true, message: 'Đã thiết lập làm tài khoản ngân hàng mặc định.' };
};
