# font-backend

## Install

Use `yarn install`

## Run

`npm run watch` runs the server and css watch, and `webpack --watch`

## How data are loaded

In the `handlers.js` the `displayReact` handler is responsible for displaying react routes. The isomorphic render is done by passing the info props to all component. For the client side render the `info` data is added as a global variable inside the `index.pug` file and affected to the state on construction.
