# MarketSim

![tests](https://github.com/dillonkmcquade/sm_sim/actions/workflows/tests.yml/badge.svg?event=push)

![Dashboard](assets/dashboard.png)
![Stock Detail page](assets/stockDetails.png)

MarketSim is a stock market simulator created using react, express, TypeScript(for the server), and MongoDB(& Redis for caching requests). MarketSim was designed to be mobile-first, but also desktop friendly. The main goal of this project is to allow users to practice making investments without the risk of the real-world stock market. Feel free to make mistakes and try new things, because it's just a simulation.

## Tech Features

- Front-end created with React & styled-components
- Mobile-first design
- Front and back-end 100% Typescript
- REST API using Express.js
- Cloud-hosted MongoDB atlas database
- Server side request caching with Redis
- Data visuals with Nivo.rocks
- JWT based session authentication (implemented by Auth0)

## User Features

- Search and gather information on up to 21,000 publically traded companies using MongoDB atlas search indexes.

- Create an account to track investments, login with google, github, microsoft via [ Auth0 ](https://auth0.com)

- Each user is given $1,000,000 to begin with.

- Data visuals for analyzing past and current performance of stocks ([nivo.rocks](https://nivo.rocks))

- Data visuals for breaking down portfolio composition ([nivo.rocks](https://nivo.rocks))

- Buy, sell stocks

- Track companies via watch list

- Real-time stock quotes from the US market ([Finnhub.io](https://finnhub.io) for quotes and historical data & [Polygon.io](https://polygon.io) for news)

- Edit user information

- Delete account if desired

## License

This project is licensed under an MIT license.
