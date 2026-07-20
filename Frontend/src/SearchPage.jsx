// import { useEffect, useState } from "react";
// import { Link, useSearchParams } from "react-router-dom";
// import { getVideos } from "./api";
// import "./SearchPage.css";

// function SearchPage() {
//   const [searchParams] = useSearchParams();
//   const query = searchParams.get("q") || "";
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const searchVideos = async () => {
//       try {
//         setLoading(true);
//         const res = await getVideos({ search: query });
//         setResults(res.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (query) searchVideos();
//   }, [query]);

//   if (loading) return <p className="search-loading">Searching...</p>;

//   return (
//     <div className="search-page">
//       <p className="search-results-count">
//         {results.length} results for "{query}"
//       </p>

//       <div className="search-results-list">
//         {results.map((video) => (
//           <Link
//             to={`/video/${video._id}`}
//             key={video._id}
//             className="search-result-card"
//           >
//             <img
//               src={video.thumbnail}
//               alt={video.title}
//               className="search-result-thumbnail"
//             />
//             <div className="search-result-info">
//               <h3 className="search-result-title">{video.title}</h3>
//               <p className="search-result-meta">
//                 {video.views} views
//               </p>
//               <p className="search-result-channel">
//                 {video.channel?.channelName || video.channel?.username}
//               </p>
//             </div>
//           </Link>
//         ))}

//         {results.length === 0 && (
//           <p className="no-results">
//             No results found for "{query}". Try a different search.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default SearchPage;


import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./SearchPage.css";

const YOUTUBE_API_KEY = "AIzaSyAiDKY3d_Vs2fVNSq-5EOv5LD_XEQUze7s";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const searchYouTube = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${YOUTUBE_API_KEY}`
        );

        const data = await res.json();

        if (data.error) {
          setError("YouTube API error: " + data.error.message);
          return;
        }

        setResults(data.items || []);
      } catch (err) {
        setError("Search failed. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) searchYouTube();
  }, [query]);

  if (loading) return <p className="search-loading">Searching YouTube...</p>;
  if (error) return <p className="search-loading">{error}</p>;

  return (
    <div className="search-page">
      <p className="search-results-count">
        {results.length} results for "{query}"
      </p>

      <div className="search-results-list">
        {results.map((video) => (
          <Link
            to={`/watch-youtube/${video.id.videoId}`}
            key={video.id.videoId}
            className="search-result-card"
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className="search-result-thumbnail"
            />
            <div className="search-result-info">
              <h3 className="search-result-title">{video.snippet.title}</h3>
              <p className="search-result-channel">
                {video.snippet.channelTitle}
              </p>
              <p className="search-result-meta">
                {new Date(video.snippet.publishedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </Link>
        ))}

        {results.length === 0 && (
          <p className="no-results">
            No results found for "{query}".
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;