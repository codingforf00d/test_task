export type SearchResult = SearchResultPerson | SearchResultPlanet | SearchResultStarship;

type SearchResultPlanet = {
  type: 'planet',
  name: string, 
  rotation_period: string, 
  orbital_period: string, 
  diameter: string, 
  climate: string, 
  gravity: string, 
  terrain: string, 
  surface_water: string, 
  population: string, 
  residents: string[], 
  films: string[], 
  created: Date, 
  edited: Date, 
  url: string
}

type SearchResultPerson = {
  type: 'person',
  name: string, 
  height: string, 
  mass: string, 
  hair_color: string, 
  skin_color: string, 
  eye_color: string, 
  birth_year: string, 
  gender: string, 
  homeworld: string, 
  films: string[], 
  species: string[], 
  vehicles: string[], 
  starships: string[], 
  created: Date, 
  edited: Date, 
  url: string
}

type SearchResultStarship = {
  type: 'starship',
  name: string, 
  model: string, 
  manufacturer: string, 
  cost_in_credits: string, 
  length: string, 
  max_atmosphering_speed: string, 
  crew: string, 
  passengers: string, 
  cargo_capacity: string, 
  consumables: string, 
  hyperdrive_rating: string, 
  MGLT: string, 
  starship_class: string, 
  pilots: string[], 
  films: string[], 
  created: Date, 
  edited: Date, 
  url: string
}