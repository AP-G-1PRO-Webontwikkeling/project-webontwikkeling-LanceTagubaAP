import express from "express";
import { getMovie } from "../database";


export function adminRouter() {
    const router = express.Router();

    router.get("/admin/:title", async (req, res) => {
        let title: string = req.params.title;

        const myMovie = await getMovie(title);
        res.render("movie", {
            movie: myMovie
        })


    });
    return router;
}