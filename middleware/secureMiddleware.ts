import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    let token: string = req.cookies.jwt;

    if (!token) {
        return res.redirect("/login");
    }
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) {
           return res.redirect("/login");
        }
        res.locals.user = user;
        next();

    });
};