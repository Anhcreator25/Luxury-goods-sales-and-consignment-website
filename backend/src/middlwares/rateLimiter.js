import rateLimit from 'express-rate-limit';

const createLimiter = ({ windowMinutes, max, message, skipSuccessful = false }) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    skipSuccessfulRequests: skipSuccessful,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};


export const loginLimiter = createLimiter({
  windowMinutes: 15,
  max: 5,
  skipSuccessful: true,
  message: "You have entered wrong login information more than 5 times. Please try again after 15 minutes.",
});

export const registerLimiter = createLimiter({
  windowMinutes: 60,
  max: 3,
  skipSuccessful: true,
  message: "You have registered too many accounts from this device. Please try again after 1 hour.",
});

export const createItemsLimiter = createLimiter({
  windowMinutes: 24 * 60, // 1 ngày
  max: 10,
  message: "You have reached the daily limit of product listings. Please come back tomorrow!",
});


export const cancelItemslimiter = createLimiter({
  windowMinutes: 60,
  max: 3,
  message: "You have cancelled orders too many times in 1 hour. Please try again after 1 hour.",
});
