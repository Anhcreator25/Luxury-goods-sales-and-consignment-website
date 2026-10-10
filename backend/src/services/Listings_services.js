import pool from '../config/db.js'

//Creating and post production
export const createListingService = async(sellerId, data)=>{
    const{
        category_id,
        title,
        brand_id,
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
    `INSERT INTO listings (seller_id, category_id, title,brand_id,condition_grade,original_price, selling_price, description ,status, created_at) 
       VALUE (?,?,?,?,?,?,?,?,'active',NOW())`;
    
    const [result]=await pool.query(query,[
        sellerId,
        category_id,
        title,
        brand_id || null,
        condition_grade || 'LIKE_NEW (99%)',
        original_price ||null,
        selling_price,
        description || null,
    ]);

    const newListingId = result.insertId;
    if(images && Array.isArray(images) && images.length>0){
        const imageValues = images.map((url,index)=>[
            newListingId,
            url,
            index ===0? 1 : 0
        ]);
        
        const imageQuery = `INSERT INTO listing_images (listing_id, image_url, is_primary)
                            VALUE ?`;
        await pool.query(imageQuery,[imageValues]);                    

    }

    return {
        id: result.insertId,
        seller_id: sellerId,
        ...data,
        status : 'active',
        created_at: new Date()
    };
}

//Get production list include : Support finding ,filter list or price production and pagination
export const getListingServices = async (queryParams) => {
    let { title, brand, category_id, page, limit } = queryParams;
   
    // Set default pagination
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    let baseQuery = `
        SELECT listings.*, brands.name AS brand_name,categories.name AS category_name, listing_images.image_url AS primary_image
        FROM listings 
        LEFT JOIN brands ON listings.brand_id = brands.id
        LEFT JOIN categories ON listings.category_id = categories.id
        LEFT JOIN listing_images ON listings.id = listing_images.listing_id AND listing_images.is_primary =1 
        WHERE 1=1
    `;

    let countQuery = `
        SELECT COUNT(*) AS total 
        FROM listings 
        LEFT JOIN brands ON listings.brand_id = brands.id
        LEFT JOIN categories ON listings.category_id = categories.id
        WHERE 1=1
    `;
    
    const queryParamsValues = [];
    const countParamsValues = [];

    // Filter by name 
    if (title) {
        baseQuery += ` AND listings.title LIKE ?`;
        countQuery += ` AND listings.title LIKE ?`;
        const titleKeyword = `%${title}%`;
        queryParamsValues.push(titleKeyword);
        countParamsValues.push(titleKeyword);
    }

    // Filter by brand
    if (brand) {
        baseQuery += ` AND brands.name LIKE ?`;
        countQuery += ` AND brands.name LIKE ?`;
        const  brandkeyword = `%${brand}%`
        queryParamsValues.push(brandkeyword);
        countParamsValues.push(brandkeyword);
    }

    // Filter by category
    if (category_id) {
        baseQuery += ` AND listings.category_id = ?`;
        countQuery += ` AND listings.category_id = ?`;
        queryParamsValues.push(category_id);
        countParamsValues.push(category_id);
    }

    // Sort infor and pagination 
    baseQuery += ` ORDER BY listings.created_at DESC LIMIT ? OFFSET ?`;
    queryParamsValues.push(limit, offset);

    //Execute a query to simultaneously retrieve the list and count the total number of records
    const [listings] = await pool.query(baseQuery, queryParamsValues);
    const [countResult] = await pool.query(countQuery, countParamsValues);

    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        data: listings,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit
        }
    };
}

//get a detail production by ID
export const getListingByIdServices = async(id)=> {
    
    const query =`SELECT listings.*, brands.name AS brand_name, categories.name AS category_name
                 FROM listings 
                 LEFT JOIN brands ON listings.brand_id = brands.id 
                 LEFT JOIN categories ON listings.category_id = categories.id 
                 WHERE listings.id=?`;

    const [row]= await pool.query(query,[id]);

          if(row.length===0){
            throw {status: 404 , message: "listings not found"}
          }
    const listing = row[0];
    const [images]= await pool.query(`SELECT id , image_url , is_primary FROM listing_images WHERE listing_id=?`,[id]);
    listing.images=images;
         
    return listing;
}

//Update and Delete operations are reserved for sellers and administrators.

// Update product
export const updateListingServices = async (id, data) => {
    const { title, condition_grade, original_price, selling_price, images, description } = data;
    
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    
    if (existing.length === 0) {
        throw { status: 404, message: 'Listing not found' };
    }

    const query = `
        UPDATE listings 
        SET title = ?, condition_grade = ?, original_price = ?, selling_price = ?, description = ? 
        WHERE id = ?
    `;
    
    await pool.query(query, [title, condition_grade, original_price, selling_price, description, id]);

    const [updateRow] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    return updateRow[0];
};

// Delete product
export const deletelistingServices = async (id) => {
    const [existing] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    
    if (existing.length === 0) {
        throw { status: 404, message: 'Listing not found' };
    }
    
    const query = 'UPDATE  listings SET status= "rejected"  WHERE id = ?';
    await pool.query(query, [id]);
    
    return { message: "Listing deleted successfully" };
};

