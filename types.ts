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
      id: string;
      name: string;
      birth_date: string;
    };
 }