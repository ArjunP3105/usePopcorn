import { useEffect, useState } from "react";

const KEY = "db8012e4";
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [loading, setloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(
    function () {
      setErrorMessage("");
      const controller = new AbortController();
      async function FetchMovies() {
        try {
          setloading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Error fetching data");
          const data = await res.json();
          setMovies(data.Search);
        } catch (err) {
          console.error(err.message);
          if (err.name !== "AbortError") {
            setErrorMessage(err.message);
          }
        } finally {
          setloading(false);
        }
      }

      FetchMovies();

      return function () {
        controller.abort();
        setErrorMessage("");
      };
    },
    [query]
  );
  return { movies, loading, errorMessage };
}
