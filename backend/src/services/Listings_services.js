import pool from '../config/db.js'

//Creating and post production
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

//Get production list include : Support finding ,filter list or price production and pagination
export const getListingServices = async (queryParams)=>{
    let {title,brand_id,category_id,page,limit}=queryParams;
   
    // Set default pagination
    page = parseInt(page)||1;
    limit = parseInt(limit)||10;
    const offset= (page-1) * limit;

    let baseQuery =`SELECT listings.*, brands.name AS brand_name
    FROM listings 
    LEFT JOIN brands ON listings.brand_id = brands.id
    WHERE 1=1`;

    let countQuery ='SELECT COUNT(*) AS total FROM listings WHERE 1=1'
    const queryParamsValues = [];
    const countParamsValues = [];

    // Filter by name
    if(title){
        baseQuery+= `AND listings.title LIKE ?`;
        countQuery+=  `AND title LIKE ?`;
        const titleKeyword = `%${title}%`;
        queryParamsValues.push(titleKeyword);
        countParamsValues.push(titleKeyword);
    }
}