import { NextFunction,Request,Response} from "express";
import jwt from "jsonwebtoken"
import { SECRET } from "../lib/constant";
import { USERS } from "../data/db";

export function usermiddleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers.authorization || req.cookies?.Authorization;
    if(!token){
        return res.status(401).json({ message: "Missing authorization token" });
    }
    console.log(token);

    try{
        const decoded=jwt.verify(token,SECRET) as string;
        console.log(decoded);
        if(!USERS[decoded]){
            return res.status(403).json({ message: "User not authorized" });
        }
        //@ts-ignore
        req.userid=decoded.userid;
        next()
        

    }catch{
return res.status(401).json({
    message:"Invalid or expired token"
})
    }

}