import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from "dotenv";
import { Movie, User } from './types';
import bcrypt from "bcrypt";

dotenv.config();
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);

export const userCollection = client.db("login").collection<User>("users");
export const movieCollection = client.db("movies").collection<Movie>("movies");


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
        await movieCollection.createIndex({ title: "text" });
        
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}
export async function getMovies() : Promise<Movie[]>{
    
    return await movieCollection.find().toArray();
}
export async function getMoviesWithSearch(search :string) : Promise<Movie[]>{
    if (search === "") {
        return await getMovies();
    }else
    return await movieCollection.find({ $text: { $search: search } }).toArray();
}

export async function getMovie(movieTitle:string) {
    
    
    return movieCollection.findOne<Movie>({title:movieTitle})
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
