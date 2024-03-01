import * as readline from 'readline-sync';
import director from "./director.json";
import data from "./movies.json";
import { Movie } from './types';

const directors = director;
const movies : Movie[] = data;

  function displaymovie(movie: Movie): void {
    console.log(`\n- ${movie.title} (${movie.id})`);
    console.log(`  - Description: ${movie.description}`);
    console.log(`  - Release year: ${movie.release_year}`);
    if (movie.is_downloadable) {
        console.log(`  - Downloadable: Yes`);
    } else {
        console
        .log(`  - Downloadable: No`);
    }
    console.log(`  - Release Date: ${movie.release_date}`);
    console.log(`  - Image url: ${movie.release_year}`);
    console.log(`  - Genre: ${movie.genre}`);
    console.log(`  - Cast: ${movie.cast.join(", ")}`);
    console.log(`  - Director: ${movie.director.name}
                       Birthdate: ${movie.director.birth_date}
                       Id: ${movie.director.id}`);
    
    
  } 
function displayMenu(): void {
  
  console.log("1. View all data");
  console.log("2. Filter by ID");
  console.log("3. Exit");
}

function main(){
    
    console.log("Welcome to the JSON data viewer!\n");
    
    let choice : number;
    do {
        displayMenu();
        choice = Number(readline.question("Please enter a choice "));

        switch (choice) {
            case 1:
                movies.forEach(element => {
                    console.log(`${element.title} (Id:${element.id})`)
                });
                
                break;
            case 2:
                
                let idChosen : number = Number(readline.question("Please enter an Id "));
                displaymovie(movies[idChosen -1]);
                break;

            case 3:
                break;    
            default:
                console.log("foute keuze")
                break;
        }
   
   
    } while (choice != 3);
}
main();