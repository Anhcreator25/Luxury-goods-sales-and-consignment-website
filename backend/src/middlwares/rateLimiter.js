import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
    windowMs :15 *60 *1000,  //15 minutes
    max: 3,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "You have entered the wrong login information more than 5 times. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
})
export const registerLimiter = rateLimit({
    windowMs :60 *60 *1000,  //1 hour
    max: 3,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "You have registered too many accounts from this device. Try again."
    },
    standardHeaders: true,
    legacyHeaders: false
})

export const createItemsLimiter = rateLimit({
    windowMs: 24 *60*60*1000,// 1 day
    max: 5,
    message: {
        success: false,
        message: "You have reached the daily limit of 5 product listings. Please come back tomorrow!"
    },
    standardHeaders: true,
    legacyHeaders: false
})
