import { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planningList, setPlanningList] = useState([]);
  const [animeEntry, setAnimeEntry] = useState(null);

  const query = `
    query ($name: String) {
    MediaListCollection (userName: $name, type: ANIME, status: PLANNING) {
      lists {
        entries {
          media {
            title {
              english,
              romaji
            }
            coverImage {
              medium
            }
            genres
            seasonYear
            siteUrl
            status
          }
        }
      }
    }
  }
  `;

  const fetchUserList = () => {
    setIsLoading(true);
    setError(null);

    const variables = { "name": username.trim() };
    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    };

    fetch(url, options)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data.errors) {
          setError("User not found! Check if user exists.")
          return
        }

        const allFetchedEntries = data.data.MediaListCollection.lists[0].entries;
        const filteredEntries = allFetchedEntries.filter(
          entry => entry.media.status !== 'NOT_YET_RELEASED'
        )

        setPlanningList(filteredEntries);
        setAnimeEntry(pickRandom(filteredEntries));
        setIsSearching(false);
      })
    .catch(err => {
        console.error(err);
        setError("User not found or API error.")
      })
    .finally(() => {
        setIsLoading(false);
      });
  };

  const pickRandom = (list) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex].media;
  }

  const getRandomEntry = () => {
    if (planningList.length === 0) return;
    setAnimeEntry(pickRandom(planningList));
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUserList()
  };

  return (
    <>
      <header>
        <h1>Randomizer for AniList</h1>
      </header>

      <main>
        {
        isSearching ? (
        <div className="content-wrap search-screen">
        {
          isLoading? (
          <div className="loading">
            <p>Fetching data</p>
          </div>
          ) :
          (
          <>
          <h2 className="description">
          Input your username to get a random show from your planning list :)
          </h2>
          <form onSubmit={handleSearch}>
            <input
            type="text"
            onChange={(e) => {
            setUsername(e.target.value)
            setError(null)
            }}
            placeholder="Enter AniList Username"
            maxLength={20}
            required
            />
            <button type="submit" style={{fontSize: "20px"}}>&#8627;</button>
          </form>
          </>
          )
        }
        {error && <p className="error-msg">{error}</p>}
        </div>
        ) :
        (
        <div className="content-wrap">
          <div className="anime-display">
            <h2><a href={animeEntry?.siteUrl} target="_blank">
              {animeEntry?.title?.english || animeEntry?.title?.romaji}
            </a></h2>
            <img src={animeEntry?.coverImage?.medium} alt="cover" />
            <p>{animeEntry?.seasonYear}</p>
            <p>{animeEntry?.genres.join(', ')}</p>
          </div>
          <div className="controls">
            <button onClick={() => getRandomEntry()}>RANDOMIZE</button>
            <button onClick={() => setIsSearching(true)}>GO BACK</button>
          </div>
        </div>
        )
        }
      </main>
    </>
  )
}

export default App
