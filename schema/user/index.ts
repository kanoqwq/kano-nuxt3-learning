import Joi from "joi";

export const userLoginSchema = Joi.object({
    password: Joi.string().required(),
    phone: Joi.string().pattern(/1\d{10}/).required(),
});

export const userRegisterSchema = Joi.object({
    nickname: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().pattern(/1\d{10}/).required(),
});