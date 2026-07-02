import z from "zod";export const SignupSchema = z.object({
    username: z.string(),
    password: z.string().min(4).max(16)
})

export const CreateCourseSchema =  z.object({
    title: z.string(),
    description: z.string(),
    url: z.string()
})
export const UpdateCourseSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    url: z.string()
});
export const CreateContentSchema = z.object({
    courseId:z.number(),
    title:z.string(),
    url:z.string()
});