const MovieCard = ({ movie:{title, vote_average, poster_path, release_date, original_language}
                   }) => {
    return(
        <div className="movie-card">
            <img src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` 
                : 'No-movie.png'} alt={title} />

            <div className="mt-4">
                <h3>{title}</h3>

                <div className="content  text-white text-sm">
                    <div className="ratings flex items-center gap-1">
                        <img src="star.svg" alt="star" className="w-4 h-4" />
                        <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                    </div>


                    <span>●</span>
                    <p className="lang">{original_language}</p>

                    <span>●</span>
                    <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>

                </div>
            </div>
        </div>
    )
}

export default MovieCard;
