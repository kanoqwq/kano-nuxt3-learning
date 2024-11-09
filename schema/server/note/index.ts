import Joi from "joi";

export const noteAddSchema = Joi.object({
    notebookId: Joi.number().required(),
});
export const notePutSchema = Joi.object({
    noteId: Joi.number().required(),
    title: Joi.string().required(),
    content_md: Joi.string().required(),
    state: Joi.number().required(),
});
export const noteDeleteSchema = Joi.object({
    noteId: Joi.number().required(),
});
export const noteParamsSchema = Joi.object({
    noteId: Joi.number().required(),
});
export const notePagParamsSchema = Joi.object({
    pageSize: Joi.string().default('10'),
    pageNum: Joi.string().default('1'),
}).unknown(true);//允许其他字段

export const noteWithNotebookIdPagParamsSchema = notePagParamsSchema.append({
    notebookId: Joi.number().required(),
})