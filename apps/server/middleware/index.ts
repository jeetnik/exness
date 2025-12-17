import { NextFunction,Request,Response} from "express";
import jwt from "jsonwebtoken"
const JWT_SECRET=process.env.JWT_SECRET||"mysecret"
interface JWTPayload{
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export function usermiddleware(req:Request,res:Response,next:NextFunction){
   
try{
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(404).send({
            message:"NO authorization in header"
        })

    }

    const token=authHeader?.split(" ")[1]
    if(!token){
        return res.status(403).json({
            message:"NO token in the header"
        })
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid token"
            });
        }
        req.user=decoded as JWTPayload;
        next();
    });
       
}catch(e){
return res.status(404).send(JSON.stringify({
    message:"Server error "
}))
}
}