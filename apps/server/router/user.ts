import { json, Router } from "express";
import { userSchema } from "@exeness/types";
import { v5 } from "uuid";
import { USERS } from "../data/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const userRouter = Router();
const SALT_ROUND = 12;
const SECRET="jwtsecrets"
const NAMESPACE =process.env.USER_NAMESPACE_UUID ||"f0e1d2c3-b4a5-6789-9876-543210fedcba";
userRouter.post("/signup", async (req, res) => {
  try {
    //get the user info
    const parseUserinfo = userSchema.safeParse(req.body);

    if (!parseUserinfo.success) {
      return res.status(403).json({
        message: "Enter the correct credentail",
      });
    }
    const { email, password } = parseUserinfo.data;
    //hash the user password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
    //gnerate the uuid from email
    const id = v5(email, NAMESPACE);
    if (USERS[id]) {
      return res.status(403).json({
        message: "User already exists",
      });
    }

    USERS[id] = {
      email,
      password: hashedPassword,
      balance: { balance: 5000 },
    };
    return res.status(200).json({
      userId: id,
    });
  } catch {
    return res.status(403).json({
      message: "Error while signing up",
    });
  }
});

userRouter.post("/signin",async (req,res)=>{
  try{  const parsedata=userSchema.safeParse(req.body);
    if(!parsedata.success){
        return res.status(403).json({
            message:"Enter the correct credentail"
        })
    }
    const {email,password}=parsedata.data
    const id=v5(email,NAMESPACE);
    const user=USERS[id]
    
    if(!user){
       return res.status(403).json({
            message:"User dose,t exits"
        })
    }

    const checkpassword=await bcrypt.compare(password,user.password);
    if(!checkpassword){
         return res.status(403).json({
            message:"Password is incorrect"
        })
   
    }
    const token=jwt.sign(id,SECRET)
    return res.status(200).json({
        message:"User sign in "
    ,token
    })
    }catch{
      return res.status(403).json({
        message:"Server error"
      })
  }
    
})



