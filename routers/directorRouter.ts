import express from "express";
import { getDirector } from "../database"; // Ensure this function is implemented

export function directorRouter() {
    const router = express.Router();

    router.get("/directors/:id", async (req, res) => {
        const directorId = req.params.id;
        try {
            const director = await getDirector(directorId);
            if (director) {
                res.render("director", { director });
            } else {
                res.status(404).send("Director not found");
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });

    return router;
}
