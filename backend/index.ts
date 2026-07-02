import { prisma } from "./db";
import jwt from "jsonwebtoken";
import express from "express";
import {
    CreateCourseSchema,
    UpdateCourseSchema,
    SignupSchema,
    CreateContentSchema

} from "./types";
const app = express()
app.use(express.json())
const JWT_ADMIN = "fuymukdfggulyllyfhggkhffgl";
const JWT_USER = "user_secret_key";

function verifyToken(token: string | undefined, secret: string): string | null {
    if (!token) return null;
    try {
        const payload = jwt.verify(token, secret);
        return typeof payload === "string" ? payload : null;
    } catch {
        return null;
    }
}

app.post("/admin/signin/",async(req,res)=>{
    const {success,data} =  SignupSchema.safeParse(req.body);
    if(!success){
        res.status(403).json({
            message:"Incorrect Input"
        })
    return
    }
    const userExists = await prisma.admin.findFirst({
        where:{
            username: data.username,
            password: data.password
        }
    })
    if(!userExists){
        res.status(403).json({
            message: "Incorrect user credentials"
        })
    return
    }
    const token = jwt.sign(userExists.id.toString(),JWT_ADMIN)
    res.json({
        token
    })
})
app.post("/admin/course",async(req,res)=>{
    const userId = verifyToken(req.headers.token as string | undefined, JWT_ADMIN)
    if(!userId){
        res.status(403).json({
            message: "Incorrect Token"
        })
        return
    }
    const {success, data}= CreateCourseSchema.safeParse(req.body)
    if(!success){
        return res.status(403).json({
            message: "Incorrect inputs"
        })
    }
    const response = await prisma.courses.create({
        data:{
            title: data.title,
            description: data.description,
            thumbnail: data.url
        }
    })
    res.json({
        id: response.id
    })
})
app.put("/admin/course", async (req, res) => {
    const userId = verifyToken(req.headers.token as string | undefined, JWT_ADMIN);

    if (!userId) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }

    const { success, data } = UpdateCourseSchema.safeParse(req.body);

    if (!success) {
        return res.status(403).json({
            message: "Invalid Input"
        });
    }

    const response = await prisma.courses.update({
        where: {
            id: data.id
        },
        data: {
            title: data.title,
            description: data.description,
            thumbnail: data.url
        }
    });

    res.json({
        message: "Course Updated Successfully"
    });
});

app.post("/admin/content", async (req, res) => {
    const userId = verifyToken(req.headers.token as string | undefined, JWT_ADMIN);

    if (!userId) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }

    const { success, data } = CreateContentSchema.safeParse(req.body);

    if (!success) {
        return res.status(403).json({
            message: "Invalid inputs"
        });
    }

    const response = await prisma.courseContent.create({
        data: {
            title: data.title,
            videoUrl: data.url,
            courseId: data.courseId
        }
    });

    res.json({
        id: response.id,
        message: "Content added successfully"
    });
});

app.get("/admin/enrollments",async (req,res) => {
    const userId = verifyToken(req.headers.token as string | undefined, JWT_ADMIN)
    if(!userId){
        return res.status(403).json({
            message:"Invalid Token"
        })
    }
    const enrollments = await prisma.enrollments.findMany();
    res.json({
        count: enrollments.length,
        enrollments
    })

})
app.get("/admin/courses",async(req,res)=>{
    const userId = verifyToken(req.headers.token as string | undefined, JWT_ADMIN)
    if(!userId){
        return res.status(403).json({
            message:"Invalid Token"
        })
    }
    const courses = await prisma.courses.findMany();
    res.json({
        courses
    })   
})

app.post("/user/signup", async (req, res) => {
    const { success, data } = SignupSchema.safeParse(req.body);

    if (!success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }

    const userExists = await prisma.users.findFirst({
        where: {
            username: data.username
        }
    });

    if (userExists) {
        return res.status(403).json({
            message: "User already exists"
        });
    }

    await prisma.users.create({
        data: {
            username: data.username,
            password: data.password
        }
    });

    res.json({
        message: "User created successfully"
    });
});

app.post("/user/signin", async (req, res) => {
    const { success, data } = SignupSchema.safeParse(req.body);

    if (!success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }

    const userExists = await prisma.users.findFirst({
        where: {
            username: data.username,
            password: data.password
        }
    });

    if (!userExists) {
        return res.status(403).json({
            message: "Incorrect username or password"
        });
    }

    const token = jwt.sign(userExists.id.toString(), JWT_USER);

    res.json({
        token
    });
});  



app.get("/user/courses", async(req, res) => {
    const userId = verifyToken(req.headers.token as string | undefined, JWT_USER)
    if(!userId){
        return res.status(403).json({
            message:"Invalid token"
        })
    }

const courses = await prisma.courses.findMany({
    select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true
    }
});
res.json({
    courses
});    
})
app.post("/user/enroll", async (req, res) => {
    const userId = verifyToken(req.headers.token as string | undefined, JWT_USER);

    if (!userId) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }

    const { courseId } = req.body;

    const response = await prisma.enrollments.create({
        data: {
            userId: Number(userId),
            courseId: courseId
        }
    });

    res.json({
        id: response.id,
        message: "Enrollment successful"
    });
});

app.get("/user/course/content/:courseId", async (req, res) => {
    const userId = verifyToken(req.headers.token as string | undefined, JWT_USER);

    if (!userId) {
        return res.status(403).json({
            message: "Invalid token"
        });
    }

    const courseId = Number(req.params.courseId);

    const contents = await prisma.courseContent.findMany({
        where: {
            courseId: courseId
        }
    });

    res.json({
        contents
    });
});
app.listen(3000,()=>{
    console.log("port is running on 3000")
})