import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IUser } from "../model/user.model.js";

export interface AuthenticatedRequest extends Request {
    user ?: IUser | null
}

export const isAuth = async(req:AuthenticatedRequest, res:Response, next:NextFunction) : Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Please login - No Auth Header" });
            return;
        }

        const token = authHeader.split(" ")[1];
        

        const decodeValue = jwt.verify(
            token as string,
            process.env.JWT_SEC as string
        ) as JwtPayload;

        if(!decodeValue || !decodeValue.user){
            res.status(401).json({
                message: " Invalid Token - No User Found",
            });
            return;
        }

        req.user = decodeValue.user;
        next();

    } catch (error) {
        console.log("JWT Verification Error: ", error);
        res.status(401).json({ message: "Please login - JWT Error" });
    }
}