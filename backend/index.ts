import { prisma } from "./db";
import jwt from "jsonwebtoken";

import express from "express";
import { CreateCourseSchema, SignupSchema } from "./types";

const app = express()

app.post("/admin/signin", async (req, res) => {
    const {success, data} = SignupSchema.safeParse(req.body);

    if (!success) {
        res.status(403).json({
            message: "Incorrect inputs"
        })
        return 
    }

    const userExists = await prisma.admin.findFirst({
        where: {
            username: data.username,
            password: data.password
        }
    })

    if (!userExists) {
        res.status(403).json({
            message: "Incorrect creds"
        })
        return
    }

    const token = jwt.sign(userExists.id.toString(), "admin_jwt_secret_123llala")

    res.json({
        token 
    })
})

app.post("/admin/course", async (req, res) => {
    const token = req.headers.token;
    const userId = jwt.verify(token, "admin_jwt_secret_123llala");

    if (!userId) {
        res.status(403).json({
            message: "Incorrect token"
        })
        return 
    }

    const {success, data} = CreateCourseSchema.safeParse(req.body);
    if (!success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        })
    }

    const response = await prisma.courses.create({
        data: {
            title: data.title,
            description: data.desciption,
            thumbnail: data.url
        }
    })
    res.json({
        id: response.id
    })

})
app.put("/admin/course", (req, res) => {
    
})

app.post("/admin/content", (req, res) => {
    
})

app.get("/admin/enrollments", (req, res) => {
    
})

app.get("/admin/courses", (req, res) => {
    
})

//// USER ENDPOINTS
app.post("/user/signup", (req, res) => {
    
})

app.post("/user/signin", (req, res) => {
    
})

app.get("/user/courses", (req, res) => {
    
})

app.post("/user/enroll", (req, res) => {
    
})

app.get("/user/course/content/:courseId", (req, res) => {
    
})
app.listen(3000);