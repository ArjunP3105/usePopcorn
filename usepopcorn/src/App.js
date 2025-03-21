import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "db8012e4";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const { movies, loading, errorMessage } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  function closeSelcted() {
    setSelectedId(null);
  }

  function onAddList(movie) {
    setWatched((i) => [...i, movie]);
  }

  function onDelete(id) {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <Navigation>
        <Logo />
        <Search
          query={query}
          setQuery={setQuery}
          setSelectedId={setSelectedId}
        />
        <NumResults movies={movies} />
      </Navigation>
      <main className="main">
        <MovieList>
          {errorMessage ? (
            <Error message={errorMessage} />
          ) : loading ? (
            <Loader />
          ) : (
            <Movie movies={movies} setSelectedId={setSelectedId} />
          )}
        </MovieList>
        <MovieList>
          {selectedId ? (
            <SelectedMovie
              id={selectedId}
              onClose={closeSelcted}
              onAddList={onAddList}
              key={selectedId}
              watched={watched}
            />
          ) : (
            <WatchedSummary watched={watched} onDelete={onDelete} />
          )}
        </MovieList>
      </main>
    </>
  );
}

function SelectedMovie({ id, onClose, onAddList, watched }) {
  const [movieDetails, setMovieDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movierating, setmovierating] = useState(null);

  const isExist = watched.map((movie) => movie.imdbID).includes(id);
  const rating = watched.find((movie) => movie.imdbID === id)?.userRating;

  useKey(onClose, "Escape");

  useEffect(
    function () {
      const controller = new AbortController();
      async function MovieDetail() {
        try {
          setLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${id}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Error Coudnt fetch result");
          const data = await res.json();
          setMovieDetails(data);
        } catch (err) {
          console.error(err.message);
        } finally {
          setLoading(false);
        }
      }
      MovieDetail();
      return function () {
        controller.abort();
      };
    },
    [id]
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  function onAdd() {
    const newMovie = {
      imdbID: id,
      title,
      imdbRating,
      poster,
      runtime: runtime.split(" ").at(0),
      userRating: movierating,
    };
    onAddList(newMovie);
    onClose();
  }

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = `usePopcorn`;
      };
    },
    [title]
  );

  return (
    <div className="details">
      {loading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onClose}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of  ${title}`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; </p>
              <p>{genre}</p>
              <p>
                <span>🌟</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isExist ? (
                <>
                  <p>You have already rated this movie {rating}⭐ </p>
                </>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size="25"
                    setmovierating={setmovierating}
                  />
                  {movierating ? (
                    <>
                      <button className="btn-add" onClick={onAdd}>
                        Add to List
                      </button>
                    </>
                  ) : (
                    ""
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Error({ message }) {
  return <div className="error">⛔{message}</div>;
}

function Loader() {
  return (
    <div className="loader">
      <span>Loading....</span>
    </div>
  );
}

function Navigation({ children }) {
  return (
    <>
      <nav className="nav-bar">{children}</nav>
    </>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const element = useRef(null);
  useKey(function () {
    if (document.activeElement === element.current) return;
    element.current.focus();
    setQuery("");
  }, "Enter");

  return (
    <input
      ref={element}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function MovieList({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Movie({ movies, setSelectedId }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <DisplayMovie
          movie={movie}
          key={movie.imdbID}
          setSelectedId={setSelectedId}
        />
      ))}
    </ul>
  );
}

function DisplayMovie({ movie, setSelectedId }) {
  function onSelect() {
    setSelectedId((id) => (id === movie.imdbID ? null : movie.imdbID));
  }
  return (
    <li key={movie.imdbID} onClick={onSelect}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched, onDelete }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched?.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));
  return (
    <>
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched?.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(2)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime.toFixed(2)} min</span>
          </p>
        </div>
      </div>
      <WatchedMovieList watched={watched} onDelete={onDelete} />
    </>
  );
}

function WatchedMovieList({ watched, onDelete }) {
  return (
    <div>
      <ul className="list">
        {watched?.map((movie) => (
          <MovieWatched movie={movie} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
}

function MovieWatched({ movie, onDelete }) {
  return (
    <div>
      <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
        x
      </button>
      <li key={movie.imdbID}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
        </div>
      </li>
    </div>
  );
}
