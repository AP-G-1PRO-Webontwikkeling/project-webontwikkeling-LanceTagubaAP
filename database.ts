import { MongoClient, Db, Collection, OptionalId } from 'mongodb';
import dotenv from "dotenv";
import { Director, Movie, User } from './types';
import bcrypt from "bcrypt";

dotenv.config();
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);

export const userCollection = client.db("login").collection<User>("users");
export const movieCollection = client.db("movies").collection<Movie>("movies");
export const directorCollection = client.db("directors").collection<Director>("directors");


const saltRounds : number = 10;


// export async function connectToDatabase(): Promise<Db> {
    
    
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db('moviesDB');
// }

export async function fetchAndInsertMovies(): Promise<void> {
    
    const moviesCount = await movieCollection.countDocuments();
    if (moviesCount === 0) {
        const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-LanceTagubaAP/main/movies.json?token=GHSAT0AAAAAACNZ6QZAA3YUO5RVIWWBQH6EZPBJC7Q");
        const movies: Movie[] = await response.json();
        await movieCollection.insertMany(movies);
        console.log('Movies inserted into MongoDB');
    }

}
export async function fetchAndInsertDirectors(): Promise<void> {
    const directorsCount = await directorCollection.countDocuments();
    if (directorsCount === 0) {
        const response = await fetch("https://raw.githubusercontent.com/LanceTagubaAP/jsonhost/main/directors.json");
        const directors: Director[] = await response.json();
        await directorCollection.insertMany(directors);
        console.log('Directors inserted into MongoDB');
    } else {
        console.log('Directors already exist in the database');
    }
}
async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}
export async function connect() {
    try {
        await client.connect();
        console.log("Connected to database");
        await createInitialUser();
        await fetchAndInsertMovies();
        await fetchAndInsertDirectors();
        await movieCollection.createIndex({ title: "text" });
        
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}
export async function getMovies() : Promise<Movie[]>{
    
    return await movieCollection.find().toArray();
}
export async function getDirectors() : Promise<Director[]>{
    
    return await directorCollection.find().toArray();
}
export async function getDirector(id:string) {
    
    return directorCollection.findOne<Director>({id:id});
}
export async function getDirectorsWithSearch(search :string) : Promise<Director[]>{
    if (search === "") {
        return await getDirectors();
    }else
    return await directorCollection.find({ $text: { $search: search } }).toArray();
}



export async function getMoviesWithSearch(search :string) : Promise<Movie[]>{
    if (search === "") {
        return await getMovies();
    }else
    return await movieCollection.find({ $text: { $search: search } }).toArray();
}

export async function getMovie(id:number) {
    
    return movieCollection.findOne<Movie>({id:id});
}

export async function getMovieTitle(title:string) {
    
    return movieCollection.findOne<Movie>({title:title});
}
export async function updateMovie(id:number,updatedMovie: Partial<Movie>) {
   await movieCollection.updateOne({id : id},{$set:updatedMovie})
}
async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let username : string | undefined = process.env.ADMIN_USER;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (username === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    const users : User[] =[
        {username: username,password: await bcrypt.hash(password, saltRounds),role: "ADMIN"},
        {username: "user",password: await bcrypt.hash("123", saltRounds),role: "USER"}

    ]
    await userCollection.insertMany(users);
    console.log('users inserted')
        
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
    
    const user = await userCollection.findOne({ username: username });
    return user;
};


export async function insertUser(user: OptionalId<User>) {
    const saltRounds = 10; // Aantal rounds voor het hashing-algoritme

    try {
        // Controleer of het wachtwoord aanwezig is en een string is
        if (typeof user.password !== "string") {
            throw new Error("Ongeldig wachtwoord");
        }

        // Hash het wachtwoord met bcrypt
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Vervang het oorspronkelijke wachtwoord door het gehashte wachtwoord
        user.password = hashedPassword;

        // Voeg de gebruiker toe aan de database
        await userCollection.insertOne(user);
        console.log("Gebruiker succesvol toegevoegd aan de database");
    } catch (error) {
        console.error("Fout bij het toevoegen van gebruiker aan de database:", error);
        throw error; // Optioneel: gooi de fout verder omhoog voor afhandeling in hoger niveau
    }
}

export async function login(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Username and password required");
    }
    let user : User | null = await userCollection.findOne<User>({username: username});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}
