import { Request, Response, NextFunction } from "express";

export function roleMiddleware(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.session.user;
        if (!user || user.role !== role) {
            return res.status(403).send("Access Denied");
        }
        next();
    };
}
