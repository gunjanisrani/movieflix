import { useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import {updateSearchCount} from './appwrite.js';
import { getTrendingMovies } from './appwrite.js';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to avoid too many API calls
  // This will update debouncedSearchTerm when searchTerm changes, 
  // but only after 1000ms of inactivity
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000,[searchTerm]);

  const fetchMovies = async (query='') => {

    setIsLoading(true); //show loading spinner
    setErrorMessage(''); //clears previous error message,if any

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}` 
            //encodeURIComponent(query) ensures special characters(like space, &, #) don’t break the URL.
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

      const response = await fetch(endpoint); 

      if (!response.ok) throw new Error('Failed to fetch movies');

      const data = await response.json();
      
      if (data.results.length === 0) {
        setErrorMessage('No movies found for your search.');
        setMovieList([]);
        return;
      }


      setMovieList(data.results);

      if (query && data.results.length > 0) { //if a movie exists for that query
        await updateSearchCount(query, data.results[0]); // Update search count in Appwrite
      }

    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Something went wrong while fetching movies.');

    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies= await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  };


  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]); // Fetch movies when debounced search term changes

  useEffect(() => {
    loadTrendingMovies();
  }, []); //trending movies will load only at the start

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">

        <header>
          <img src="./hero.png" alt="Hero Banner" className="hero" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && debouncedSearchTerm ==='' && ( 
          //trending movies will only show if there are any
          //if user searches for something, trending movies will not show

          <section className={`trending transition-opacity duration-500 ${debouncedSearchTerm === '' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie,index ) => (
                <li key={movie.$id}> //key helps React track changes in the list
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))
              }
            </ul>
            
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading ? (
            <>
              <Spinner />
              <p className="text-white">Loading...</p>
            </>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

        </section>
      </div>
    </main>
  );
};

export default App;
