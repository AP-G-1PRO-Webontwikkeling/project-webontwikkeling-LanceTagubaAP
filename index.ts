import * as readline from 'readline-sync';
import director from "./director.json";
//import data from "./movies.json";

import { Movie, User } from './types';
import express from "express";
import { connect ,getMovie, getMovieTitle, insertUser, updateMovie} from "./database";
import dotenv from "dotenv";
import { secureMiddleware } from './middleware/secureMiddleware';
import { flashMiddleware } from './middleware/flashMiddleware';
import session from "./session";
import cookieparser from "cookie-parser";
import path from "path";

import { loginRouter } from './routers/loginRouter';
import { homeRouter } from './routers/homeRouter';
import {adminRouter} from './routers/adminRouter';
import * as jwt from 'jsonwebtoken';
import { roleMiddleware } from './middleware/roleMiddleware';
import { directorRouter } from './routers/directorRouter';


dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.use(cookieparser());
app.use(flashMiddleware);
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

app.use("/", loginRouter());
app.use("/",directorRouter());
app.use("/", secureMiddleware, homeRouter());
app.use("/edit", secureMiddleware, roleMiddleware("ADMIN"), adminRouter());

app.get("/", (req, res) => {
    const token = req.cookies.jwt;
    if (token) {
        // Als de gebruiker is ingelogd, stuur ze door naar /movies
        res.redirect("/movies");
    } else {
        // Als de gebruiker niet is ingelogd, ga verder met de volgende middleware
        res.redirect("/login");
    }
    
});

app.get("/register",(req , res) => {
    res.render("register")
});

app.post("/register", async(req , res) => {
    const { username, password } = req.body;

    

    try {
        // Controleer of gebruikersnaam en wachtwoord zijn verstrekt
        if (!username || !password) {
            return res.status(400).send("Gebruikersnaam en wachtwoord zijn verplicht");
        }
        let user : User =  {username: String(username),password: password,role: "USER"}

        // Voeg de gebruiker toe aan de database
        await insertUser( user);
        console.log('inserted')

        // Stuur een succesvolle reactie
        res.status(200).send("Gebruiker succesvol geregistreerd");
        res.redirect("/");
    } catch (error) {
        // Als er een fout optreedt, stuur een foutreactie
        console.error("Fout bij registreren:", error);
        res.status(500).send("Er is een interne serverfout opgetreden bij het registreren van de gebruiker");
    }
});





app.get("/movies/:id",async (req,res) => {
    let id : number = parseInt(req.params.id);
    
    const myMovie = await getMovie(id);
    res.render("movie",{
        movie : myMovie
    })

});



app.get("/edit/:id", async (req, res) => {
    const movieId =parseInt(req.params.id) ;
    try {
        const movie = await getMovie(movieId);
        const genres = ["Science Fiction", "Drama", "Action"];
        if (movie) {
            res.render("admin", { movie,genres });
        } else {
            res.status(404).send("Movie not found");
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

app.post("/edit", async (req, res) => {
    const { id, title, description, release_date, genre, director, is_downloadable } = req.body;
    
    const movieId =parseInt(req.body.id);
    try {
        const movie = await getMovie(movieId);
        if (!movie) {
            return res.status(404).send("Movie not found");
        }
        await updateMovie(movieId, {
            title,
            description,
            release_date,
            genre,
            cast: movie.cast, // Keep the original cast
            director: { name: director },
            is_downloadable: is_downloadable === "true",
        });
        
        res.redirect("/movies");
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});



app.listen(app.get("port"), async () => {
    try {
        await connect();
        console.log("Server started on http://localhost:" + app.get('port'));
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
    
    

    }
);












// const directors = director;
// //const movies : Movie[] = data;

// function displaymovie(movie: Movie): void {
//     console.log(`\n- ${movie.title} (${movie.id})`);
//     console.log(`  - Description: ${movie.description}`);
//     console.log(`  - Release year: ${movie.release_year}`);
//     if (movie.is_downloadable) {
//         console.log(`  - Downloadable: Yes`);
//     } else {
//         console
//             .log(`  - Downloadable: No`);
//     }
//     console.log(`  - Release Date: ${movie.release_date}`);
//     console.log(`  - Image url: ${movie.release_year}`);
//     console.log(`  - Genre: ${movie.genre}`);
//     console.log(`  - Cast: ${movie.cast.join(", ")}`);
//     console.log(`  - Director: ${movie.director.name}
//                        Birthdate: ${movie.director.birth_date}
//                        Id: ${movie.director.id}`);


// }
// function displayMenu(): void {

//     console.log("1. View all data");
//     console.log("2. Filter by ID");
//     console.log("3. Exit");
// }

// async function main() {
//     const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-LanceTagubaAP/main/movies.json?token=GHSAT0AAAAAACNZ6QZAA3YUO5RVIWWBQH6EZPBJC7Q");
//     const movies: Movie[] = await response.json();

//     console.log("Welcome to the JSON data viewer!\n");

//     let choice: number;
//     do {
//         displayMenu();
//         choice = Number(readline.question("Please enter a choice "));

//         switch (choice) {
//             case 1:
//                 movies.forEach(element => {
//                     console.log(`${element.title} (Id:${element.id})`)
//                 });

//                 break;
//             case 2:

//                 let idChosen: number = Number(readline.question("Please enter an Id "));
//                 displaymovie(movies[idChosen - 1]);
//                 break;

//             case 3:
//                 break;
//             default:
//                 console.log("foute keuze")
//                 break;
//         }


//     } while (choice != 3);
// }
// main();