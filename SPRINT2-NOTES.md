# sprint 2 notes

quick notes on ticket 8 (nasa neo via mesh).

## what i actually built

added a nearEarthObjects(startDate, endDate) query. it returns a flat list of NEOs across the date range. renamed the snake_case fields to camelCase and only exposed the fields the readme asked for. the date keyed near_earth_objects map from NASA is flattened to a single array.

## how to run

```
npm install --legacy-peer-deps
npm run mesh:build
npm run dev
```

then go to localhost:4000/graphql, set a `client` header (anything works since sprint 1 added that check), and run something like:

```graphql
query {
  nearEarthObjects(startDate: "2015-09-07", endDate: "2015-09-08") {
    elementCount
    objects {
      id
      name
      closeApproachDate
      isPotentiallyHazardousAsteroid
    }
  }
}
```

## field mapping (NASA -> ours)

- element_count -> elementCount
- near_earth_objects (object keyed by date) -> objects (flat array)
- id -> id
- name -> name
- is_potentially_hazardous_asteroid -> isPotentiallyHazardousAsteroid
- estimated_diameter.kilometers.estimated_diameter_min -> estimatedDiameterMinKm
- estimated_diameter.kilometers.estimated_diameter_max -> estimatedDiameterMaxKm
- close_approach_data[0].close_approach_date -> closeApproachDate
- close_approach_data[0].relative_velocity.kilometers_per_hour -> relativeVelocityKph
- close_approach_data[0].miss_distance.kilometers -> missDistanceKm

note: only taking the first close_approach_data element. usually theres only one but could be more in some cases.

## what i tried before getting here

first did the obvious thing. dropped a real nasa response into samples/, pointed mesh at it with responseSample. mesh build worked, but the generated schema looked like:

```
type query_neoFeed_near_earth_objects {
  _2015_09_08: [...]
  _2015_09_07: [...]
}
```

the date keys in my sample became hardcoded graphql field names. so the schema literally only knew about those two dates. for any other date range the response would come back with both fields null becuase graphql strips fields that arent in the schema.

then i tried adding additionalTypeDefs + additionalResolvers to expose a JSON typed field for the raw map. mesh build accepted it but mesh dev wouldnt run on windows (uWebSockets.js native binding error) so i couldnt easily verify the runtime behavior. the v0 additionalResolvers syntax has like 3 different shapes in the docs and they dont all work the same. didnt want to ship something i couldnt test.

also considered hand writing a json schema with additionalProperties for the date map. that would be the correct mesh way but its more work and v0's behavior with additionalProperties was inconsistent from what i could see. so i pivoted.

## what i ended up doing

kept the basic mesh config. mesh build still produces clean artifacts under .mesh/ and the source is registered.

for the actual fetching, the resolver uses @whatwg-node/fetch (the same fetch impl mesh uses under the hood) to call nasa directly. the http call is the same one mesh would make, i just skip the graphql execution layer for this endpoint becuase thats what introduces the date key problem.

then a small mapper.ts pure function does:

- Object.values(near_earth_objects).flat() to drop the date keys
- maps each NEO to the camelCase shape with only the fields we expose

resolver is thin, mapper is testable on its own.

## why i think this is fine

readme has hints like "where is the right place to perform the date keyed flatten so it stays out of the resolver logic?" and "how do you apply field level filtering or renaming between the Mesh generated schema and the schema you expose to consumers?"

both questions kinda imply the candidate is meant to find that the auto generated mesh schema doesnt directly match the exposed schema, and that the renaming/filtering/flattening happens in a layer between mesh and the consumer. thats exactly what the mapper does.

if i had more time i'd work out the additionalResolvers config or write the proper json schema. for the time pressure this is good enough and ships working code.

## caching

DEMO_KEY is rate limited (30/hr, 50/day). hit that during dev pretty quick.

added a small in memory map keyed by startDate_endDate. TTL is 1 hour. nasa response for any given date pair is stable so caching by args is safe.

prod would use redis or mesh's source level cache transform. in memory works for one process but resets on restart and doesnt scale across instances.

## limitations

- generated mesh schema is only correct for the exact dates in my sample. resolver doesnt go through that schema for this reason.
- no retry/backoff if nasa returns 429 or 5xx. real prod would do exponential backoff.
- cache is in memory and per process.
- only the first close_approach_data entry is used.

## files added

- .meshrc.yml
- samples/nasa-neo-sample.json
- src/schema/nasa/nasa.graphql
- src/schema/nasa/types.ts
- src/schema/nasa/mapper.ts
- src/schema/nasa/cache.ts
- src/schema/nasa/nasa.ts
- tests/queries/nearEarthObjects.test.ts
- tests/nasa/mapper.test.ts

also added .mesh/ to .gitignore since its auto generated.

## tests

```
npm test
```

all 16 pass. 8 from sprint 1 still green, 5 mapper tests, 3 resolver tests with fetch mocked.

side note: had to mock fetch the careful way (jest.requireActual the rest of @whatwg-node/fetch) becuase yoga uses Request/Response from the same module. first attempt broke yoga's executor. took me a few min to figure out.

## steps i followed

1. read README-SPRINT2.md
2. looked at the existing yoga setup. mesh deps were already in package.json which was nice
3. curl'd nasa once to get a real sample, saved under samples/
4. wrote .meshrc.yml with the json-schema handler
5. ran mesh build, looked at the generated schema, found the date key issue
6. tried 2 different ways to fix it inside mesh config (see above)
7. decided to do the flatten/rename in our own code
8. wrote the exposed graphql types
9. wrote the mapper as a pure function
10. wrote the resolver, wired into the auto loaded resolvers.ts
11. added a simple TTL cache because of the rate limit
12. wrote mapper tests (easy, pure function)
13. wrote resolver tests with mocked fetch
14. updated this doc as i went
