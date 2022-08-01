<p align="center">
  <a href="https://github.com/igorbrasilc/Sing-Me-A-Song">
    <span>&#127908;</span>
  </a>

  <h3 align="center">
    Sing me a Song
  </h3>
</p>

## Description:

The Sing me a Song app allows users to share, recommend, upvote and downvote YouTube music videos! It contains unit testing and integration testing for server side.

## Setup:

```bash
$ git clone https://github.com/igorbrasilc/Sing-Me-A-Song.git

$ cd Sing-Me-A-Song/back-end/

$ npm i

$ cd ..

$ cd Sing-Me-A-Song/front-end/

$ npm i
```

## Usage:

- On the server side:

```bash
$ cd Sing-Me-A-Song/back-end/

$ npm run dev
```

- On client side:

```bash
$ cd Sing-Me-A-Song/front-end/

$ npm start
```

## Tests:

- Integration tests:

```bash
$ cd Sing-Me-A-Song/back-end/

$ npm run test:integration
```

- Unit tests:

```bash
$ cd Sing-Me-A-Song/back-end/

$ npm run test:unit
```

## Client side tests (e2e) with Cypress:

### Comming up soon!

- General routes: (no auth needed on header's request)

```
- POST /recommendations
    - Route to register a new recommendation link
    - body: {
        "name": "Unique title name",
        "youtubeLink": "https://youtube.com/..."
    }
```
```
- GET /recommendations
    - Route to get a list of 10 first recommendations, no filter
```
```
- GET /recommendations/top/:amount
    - Route to get a list of the top amount (variable) recommendations
```
```
- GET /recommendations/:id
    - Route to get a recommendation by id
```
```
- POST /recommendation/:id/upvote
    - Increases the score of the recommendation with {id} by one
    - body: {}
```
```
- POST /recommendation/:id/downvote
    - Decreases the score of the recommendation with {id} by one
    - body: {}
```
