import * as readline from 'readline-sync';
import director from "./director.json";
import data from "./movies.json";

const directors = director;
const movies : Movie = data;


interface Movie {
    // id: number;
    // title: string;
    // description: string;
    // release_year: number;
    // is_downloadable: boolean;
    // release_date: string;
    // image_url: string;
    // genre: string;
    // cast: string[];
    // director: {
    //   id: string;
    //   name: string;
    //   birth_date: string;
    // };
  }
function displayMenu(): void {
  
  console.log("1. View all data");
  console.log("2. Filter by ID");
  console.log("3. Exit");
}


function main(){
    
    console.log("Welcome to the JSON data viewer!\n");
    


    let choice : number = Number(readline.question("Please enter a choice"));
    do {
        displayMenu();
        choice = Number(readline.question("Please enter a choice"));

        switch (choice) {
            case 1:
                
                break;
            case 2:
                break;

            default:
                console.log("foute keuze")
                break;
        }
   
   
    } while (choice != 3);

}
console.log(movies);