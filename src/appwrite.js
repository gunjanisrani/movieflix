import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client() //setting up a client instance to connect to Appwrite server
    // pointing to appwrite servers
    .setEndpoint('https://cloud.appwrite.io/v1') 

    .setProject(PROJECT_ID);

//initializes the database api, so we can run queries like create, update, delete, and list documents
const database = new Databases(client); 

export const updateSearchCount = async(searchTerm, movie)=> {
    try{
        const result= await database.listDocuments(
            DATABASE_ID, COLLECTION_ID, 
            [Query.equal('searchTerm', searchTerm), //searching for a document where searchTerm matches the user's search
            ])
        
        if(result.documents.length > 0){ // if a document with the search term exists, we update the count
            const doc=result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
        })

    }else{ // if no document exists with the search term, we create a new document with count set to 1
        await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            searchTerm,
            count: 1,
            movie_id: movie.id,
            poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
        });
    }

    }catch(error){
        console.error('Error updating search count:', error);
}
}

// Function to get trending movies based on search count using appwrite
// This function retrieves the top 5 movies with the highest search count
export const getTrendingMovies = async () => {
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.orderDesc('count'),
            Query.limit(5),
        ])
        return result.documents;
        
    } catch(error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}