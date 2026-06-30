import z from "zod";

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const CreateCourseSchema = z.object({
    title: z.string(),
    desciption: z.string(),
    url: z.string()
})