import pool from '../config/db.js'

export const createListingService = async(sellerId, data)=>{
    const{
        category_id,
        title,
        brand,
        condition_grade,
        original_price,
        selling_price,
        images,
        description,
    }=data;

    if(!title || !selling_price || !category_id){
        throw { status:400 , message:'Please fill in the title, selling price, and product category.'}
    }

    const query =
    `INSERT INTO listings (seller_id, category_id, title,brand,condition_grade,original_price, selling_price,  images, description ,status, created_at) 
       VALUE (?,?,?,?,?,?,?,?,?,'active',NOW())`;
    
    const [result]=await pool.query(query,[
        sellerId,
        category_id,
        title,
        brand || null,
        condition_grade || 'LIKE_NEW (99%)',
        original_price ||null,
        selling_price,
        images || null,
        description || null,
    ]);

    return {
        id: result.insertId,
        seller_id: sellerId,
        ...data,
        status : 'active',
        created_at: new Date()
    };
}