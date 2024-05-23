import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from "dotenv";
import { Movie, User } from './types';
import bcrypt from "bcrypt";

dotenv.config();
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(MONGODB_URI);

const moviesCollection: Collection<Movie> = client.db('movies').collection("movies");
export const userCollection = client.db("login-express").collection<User>("users");

const saltRounds : number = 10;


export async function connectToDatabase(): Promise<Db> {
    
    
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('moviesDB');
}

export async function fetchAndInsertMovies(db: Db): Promise<void> {
    const moviesCollection: Collection<Movie> = db.collection('movies');
    const moviesCount = await moviesCollection.countDocuments();
    if (moviesCount === 0) {
        const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-LanceTagubaAP/main/movies.json?token=GHSAT0AAAAAACNZ6QZAA3YUO5RVIWWBQH6EZPBJC7Q");
        const movies: Movie[] = await response.json();
        await moviesCollection.insertMany(movies);
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
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}
export async function getMovies() : Promise<Movie[]>{
    const db = await connectToDatabase();
    const moviesCollection = db.collection<Movie>('movies');
    return await moviesCollection.find().toArray();


}


async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user : User | null = await userCollection.findOne<User>({email: email});
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
