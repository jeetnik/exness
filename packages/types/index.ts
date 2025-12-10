import {z} from "zod"

export const userSchema=z.object({
    email:z.email(),
    password:z.string().min(6).max(20)
});