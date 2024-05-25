import express from "express";
import { fetchAndInsertMovies, getMovies, getMoviesWithSearch } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";

export function homeRouter() {
    const router = express.Router();

    router.get("/movies", async (req, res) => {
        // Connect to MongoDB


        // Fetch and insert movies if necessary


        // Fetch movies from MongoDB
        //const moviesCollection = db.collection<Movie>('movies');
        
        /**Hier komt eerste pagina */

        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

        const searchTerm = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
        
        const filteredFilms = await getMoviesWithSearch(searchTerm);
        
        // const filteredFilms = movies.filter(film => {
        //     return film.title.toLowerCase().includes(searchTerm); // Filtering based on movie title
        // });



        let sortedFilms = [...filteredFilms].sort((a, b) => {
            if (sortField === "name") {
                return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
            } else if (sortField === "releasteDate") {
                return sortDirection === "asc" ? a.release_year - b.release_year : b.release_year - a.release_year;
            } else if (sortField === "director") {
                return sortDirection === "asc" ? a.director.name.localeCompare(b.director.name) : b.director.name.localeCompare(a.director.name);
            } else if (sortField === "genre") {
                return sortDirection === "asc" ? a.genre.localeCompare(b.genre) : b.genre.localeCompare(a.genre);
            } else if (sortField === "downloadable") {
                return sortDirection === "asc" ? a.is_downloadable === b.is_downloadable ? 0 :
                    a.is_downloadable ? -1 : 1 :
                    sortDirection === "asc" ? a.is_downloadable ? -1 : 1 : a.is_downloadable ? 1 : -1;
            } else {
                return 0;
            }
        });


        const sortFields = [
            { value: 'name', text: 'Name', selected: sortField === 'name' ? 'selected' : '' },
            { value: 'releasteDate', text: 'Release Date', selected: sortField === 'releaseDate' ? 'selected' : '' },


            { value: 'director', text: 'Director', selected: sortField === 'director' ? 'selected' : '' },
            { value: 'genre', text: 'Genre', selected: sortField === 'genre' ? 'selected' : '' },
            { value: 'downloadable', text: 'Downloadable', selected: sortField === 'downloadable' ? 'selected' : '' }

        ];

        const sortDirections = [
            { value: 'asc', text: 'Ascending', selected: sortDirection === 'asc' ? 'selected' : '' },
            { value: 'desc', text: 'Descending', selected: sortDirection === 'desc' ? 'selected' : '' }
        ];
        const user =
        res.render("index", {
            films: sortedFilms,
            sortFields: sortFields,
            sortDirections: sortDirections,
            sortField: sortField,
            sortDirection: sortDirection,
            search: searchTerm
        });
    });
    router.post("/logout", secureMiddleware, async (req, res) => {
        res.clearCookie("jwt");
        res.redirect("/login");
    });

    return router;
}