import * as readline from 'readline-sync';
import director from "./director.json";
//import data from "./movies.json";
import { Movie } from './types';
import express from "express";
import { connectToDatabase, fetchAndInsertMovies } from "./database";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("port", port);
app.use(express.static("public"));
app.set("view engine", "ejs");

let movies : Movie[] = [];

app.get("/",async (req, res) => {
    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Fetch and insert movies if necessary
    await fetchAndInsertMovies(db);

    // Fetch movies from MongoDB
    const moviesCollection = db.collection<Movie>('movies');
    movies = await moviesCollection.find().toArray();





    /**Hier komt eerste pagina */

    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

    const searchTerm = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";

    const filteredFilms = movies.filter(film => {
        return film.title.toLowerCase().includes(searchTerm); // Filtering based on movie title
    });
    


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
        
       
        { value: 'director', text: 'Director', selected: sortField === 'director' ? 'selected' : ''},
        { value: 'genre', text: 'Genre', selected: sortField === 'genre' ? 'selected' : ''},
        { value: 'downloadable', text: 'Downloadable', selected: sortField === 'downloadable' ? 'selected' : '' }

    ];

    const sortDirections = [
        { value: 'asc', text: 'Ascending', selected: sortDirection === 'asc' ? 'selected' : ''},
        { value: 'desc', text: 'Descending', selected: sortDirection === 'desc' ? 'selected' : ''}
    ];








    res.render("index",{
        films : sortedFilms,
        sortFields : sortFields,
        sortDirections: sortDirections,
        sortField: sortField,
        sortDirection: sortDirection,
        search : searchTerm
    });
});

app.get("/movies/:title",(req,res) => {
    let title : string = req.params.title;
    console.log(title);

    const myMovie = movies.find(movie => movie.title === title);

    console.log(myMovie)


    res.render("movie",{
        movie : myMovie
    })

})


app.listen(app.get("port"), async () => {
    console.log("[server] http://localhost:" + app.get("port"));
    
    

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