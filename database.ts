import { MongoClient, Db, Collection } from 'mongodb';

export interface Movie {
    title: string;
    // Andere filmkenmerken
}

export async function connectToDatabase(): Promise<Db> {
    const client = new MongoClient('mongodb://localhost:27017');
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

