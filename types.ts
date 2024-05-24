import { ObjectId } from "mongodb";
export interface Movie {
    id: number;
    title: string;
    description: string;
    release_year: number;
    is_downloadable: boolean;
    release_date: string;
    image_url: string;
    genre: string;
    cast: string[];
    director: {
      id?: string;
      name: string;
      birth_date?: string;
    };
 }

 export interface User {
  _id?: ObjectId;
  username: string;
  password?: string;
  role: "ADMIN" | "USER";
}
export interface FlashMessage {
  type: "error" | "success" | "info"
  message: string;
}
