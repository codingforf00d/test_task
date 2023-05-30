import express from 'express';
import { createClient } from 'redis';
import axios from 'axios';
import {SearchResult} from './types';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';

const app = express();
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});

const SWAPI_BASE_URL = 'https://swapi.dev/api';


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_: any, res: any) => {
  res.send(`
    <form method=POST>
      <input type=text name=search>
      <button type=submit>Search</button>
    </form>
  `);
});

app.post('/', async (req: any, res: any) => {
  const searchTerm: string = req.body.search;
  const cacheKey = `search:${searchTerm}`;
  const existResult = await redisClient.get(cacheKey);
  if (existResult) {
    const renderedResult = renderSearchResults(JSON.parse(existResult));
    return res.send(renderedResult);
  }

  const [people, planets, starships] = await Promise.all([
    axios.get(`${SWAPI_BASE_URL}/people/?search=${searchTerm}`),
    axios.get(`${SWAPI_BASE_URL}/planets/?search=${searchTerm}`),
    axios.get(`${SWAPI_BASE_URL}/starships/?search=${searchTerm}`),
  ]);

  const searchResults: SearchResult[] = [
    ...people.data.results.map((person: any) => ({
      type: 'person',
      ...person,
    })),
    ...planets.data.results.map((planet: any) => ({
      type: 'planet',
      ...planet,
    })),
    ...starships.data.results.map((starship: any) => ({
      type: 'starship',
      ...starship
    })),
  ];

  await redisClient.set(cacheKey, JSON.stringify(searchResults));

  const renderedResult = renderSearchResults(searchResults);

  const token: string = req.cookies.token;
  if (!token) {
    res.cookie('token', randomUUID(), {
      maxAge: 7 * 24 * 60 * 60 * 1000, // one week
    });
  }
  const previousResults = await redisClient.get(token) ?? '[]';
  const newResults = JSON.stringify([...JSON.parse(previousResults), ...searchResults]);
  await redisClient.set(token, newResults);

  res.send(renderedResult);
});

app.get('/previous', async (req: any, res: any) => {
  const token = req.cookies.token;
  if (!token) {
    res.cookie('token', randomUUID(), {
      maxAge: 7 * 24 * 60 * 60 * 1000, // one week
    });

    return res.end()
  }

  const previousResults = await redisClient.get(token) ?? '[]';
  const rendered = renderSearchResults(JSON.parse(previousResults), true);
  res.send(rendered);
})

const renderSearchResults = (searchResults: SearchResult[], previous: boolean = false) => {
  let resultHtml = '';

  for (const result of searchResults) {
    let detailsHtml = '';

    if (result.type === 'planet') {
      const { name, diameter, population } = result;
      detailsHtml = `<p>Name: ${name}</p><p>Diameter: ${diameter}</p><p>Population: ${population}</p>`;
    } else if (result.type === 'starship') {
      const { name, length, crew } = result;
      detailsHtml = `<p>Name: ${name}</p><p>Length: ${length}</p><p>Crew: ${crew}</p>`;
    } else if (result.type === 'person') {
      const {name, gender, mass} = result;
      detailsHtml = `<p>Name: ${name}</p><p>Length: ${gender}</p><p>Crew: ${mass}</p>`;
    }

    resultHtml += `<li>${result.type}: ${result.name}${detailsHtml}</li>`;
  }

  const result = `
    <ul>
      ${resultHtml.length ? resultHtml : 'No results found'}
    </ul>
  `;
  return previous ? result : result+`<form method=POST>
                                      <input type=text name=search>
                                      <button type=submit>Search</button>
                                    </form>`
}

redisClient.connect().then(() => {
  app.listen(3000, async () => {
    console.log('Server started on port 3000');
  });
}).catch((e) => console.log(e))

