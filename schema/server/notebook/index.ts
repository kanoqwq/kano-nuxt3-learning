import Joi from "joi";

export const notebookAddSchema = Joi.object({
    name: Joi.string().required()
});
export const notebookPutSchema = Joi.object({
    name: Joi.string().required(),
    id: Joi.number().required(),
});
export const notebookDeleteSchema = Joi.object({
    id: Joi.number().required(),
});
