import { Router } from "express";
import prisma from "db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usermiddleware } from "../middleware";

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";
const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(403).json({
            message: "REQUIRED EMAIL AND PASSWORD"
        });
    }

    const ifExist = await prisma.user.findUnique({
        where: { email }
    });

    if (ifExist) {
        return res.status(403).json({
            message: "USER ALREADY EXIXTs"
        })
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPass
        }
    });

    res.status(200).json({
        userId: user.id
    });
} catch (e) {
    console.error("signup error: ", e);
    res.status(403).json({
        message: "Error while signing up"
    });
}
});

router.post("/signin", async (req, res) => {
    
  try{
    const { email, password } = req.body;

    if( !email || !password ){
        return res.status(401).json({
            message: "Email and Password are required"
        });
    }

    const dbData = await prisma.user.findUnique({
        where: {email}
    });

    if (!dbData) {
        return res.status(403).json({
            message: "Incorrect credentials"
        });
    }

    const isMatch = await bcrypt.compare(password, dbData.password);

    if(!isMatch){
        return res.status(403).json({
            message: "Incorrect credentials"
        });
    }

    const jwtToken = await jwt.sign({
        userId: dbData.id,
        email: dbData.email
    },
    JWT_SECRET,{
        expiresIn:'1h'
    });
    
    res.status(200).json({
        token: jwtToken
    });
} catch(e){
    console.error("Signin error: ", e);
    res.status(500).json({
        message:"Internal server issue"
    });
}
})

router.get("/balance", usermiddleware, async (req, res) => {
  try {
    const userPayload = req.user;

    if (!userPayload || !userPayload.email) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }

    const user = await prisma.user.findUnique({
        where: { email: userPayload.email }
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const balance = typeof user.balance === 'string' ? JSON.parse(user.balance) : user.balance;

    res.status(200).json({
        usd_balance: Math.floor(balance.usd.tradable * 100),
        locked_balance: Math.floor(balance.usd.locked * 100),
        total_balance: Math.floor((balance.usd.tradable + balance.usd.locked) * 100)
    });

} catch (e) {
    console.error("Error while getting balance", e);
    res.status(500).json({
        message: "Error while retrieving balance from db"
    });
}
});

export default router;


