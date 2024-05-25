import express from "express";
import { getMovie, updateMovie } from "../database"; // Veronderstel dat deze functies zijn geïmplementeerd

export function adminRouter() {
    const router = express.Router();

    router.get("/edit/:id", async (req, res) => {
        const movieId =parseInt(req.params.id) ;
        try {
            const movie = await getMovie(movieId);
            if (movie) {
                res.render("admin", { movie });
            } else {
                res.status(404).send("Movie not found");
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    router.post("/edit", async (req, res) => {
        const { id, title, description, release_date, genre, director, is_downloadable } = req.body;
        try {
            const movie = await getMovie(id);
            if (!movie) {
                return res.status(404).send("Movie not found");
            }
            await updateMovie(id, {
                title,
                description,
                release_date,
                genre,
                cast: movie.cast, // Keep the original cast
                director: { name: director },
                is_downloadable: is_downloadable === "true",
            });
            res.redirect("/");
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    return router;
}
