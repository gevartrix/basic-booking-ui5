# Basic Booking App

A simple full-stack web application showcasing possibilities of [UI5 Web Components](https://sap.github.io/ui5-webcomponents/). Used as a demo during the second day (December the 4th, 2020) of SAP Business Technology Platform: Co-Innovation and Certification Day at SAP Labs CIS.

## Table of Contents

<details>
  <summary>Click to expand</summary>

  - [Summary](#summary)
    * [Technology Stack and Tools](#technology-stack-and-tools)
    * [Project Structure](#project-structure)
    * [Screenshots](#screenshots)
  - [Quick Start](#quick-start)
  - [Contributing](#contributing)
    * [Style Guide](#style-guide)
  - [License](#license)
</details>

## Summary

Demo of a single page application with RESTful API that allows SAP employees to request and book various devices for several days period. The requests are managed (accepted or denied) by administrator. There is also a build-in validation feature of the booking dates (i.e. a device can't be booked if it's already been booked by someone else for these dates). Also this demo app doesn't require a password to sign in, since it's presented as an internal web application.

### Technology Stack and Tools

- [Express.js](https://expressjs.com/) as a server/routing API
- [Node.js](https://nodejs.org/) as a server JavaScript runtime environment
- [React](https://reactjs.org/) as a client (front-end) framework
- [MongoDB](https://mongodb.com/) as database
- [UI5 Web Components](https://github.com/SAP/ui5-webcomponents) as a framework-independent UI elements for the front-end
- [Axios](https://github.com/axios/axios) as a HTTP client
- [JsonWebToken](https://github.com/auth0/node-jsonwebtoken) as a token signing/verification method
- [express-validator](https://github.com/express-validator/express-validator) as requests sanitizer middleware
- [express-swagger-generator](https://github.com/pgroot/express-swagger-generator) as an automatic API documentation generator based on Express routes
- [Prettier](https://prettier.io/) as a code formatter.

### Project Structure

<details>
  <summary>Click to expand</summary>

    ├── client
    │   └── src
    │       ├── components
    │       │   ├── elements
    │       │   │   ├── BookingRow.jsx
    │       │   │   ├── BookingsTable.jsx
    │       │   │   ├── ErrorNotice.jsx
    │       │   │   ├── Navbar.jsx
    │       │   │   ├── PendingRow.jsx
    │       │   │   ├── PendingsTable.jsx
    │       │   │   └── SuccessNotice.jsx
    │       │   └── pages
    │       │       ├── Admin.jsx
    │       │       ├── Login.jsx
    │       │       └── User.jsx
    │       ├── context
    │       │   └── userContext.js
    │       ├── App.css
    │       ├── App.js
    │       ├── index.js
    │       └── serviceWorker.js
    │   ├── package.json
    │   └── package-lock.json
    └── server
        ├── api
        │   ├── middleware
        │   │   ├── authentication.verification.js
        │   │   ├── authorization.verification.js
        │   │   └── body.validation.js
        │   ├── models
        │   │   ├── Booking.model.js
        │   │   ├── Device.model.js
        │   │   └── User.model.js
        │   └── routes
        │       ├── auth.route.js
        │       ├── bookings.route.js
        │       └── devices.route.js
        ├── .env.dist
        ├── package.json
        ├── package-lock.json
        └── server.js
    ├── .eslintrc.json
    ├── .prettierrc.json
    ├── package.json
    └── package-lock.json
</details>

### Screenshots

<details>
  <summary>Click to view</summary>

  ![User's booking process](https://raw.githubusercontent.com/gevartrix/basic-booking-ui5/master/assets/user_book.png?raw=true)

  ![Device details window](https://raw.githubusercontent.com/gevartrix/basic-booking-ui5/master/assets/user_viewdetails.png?raw=true)

  ![Admin Panel](https://raw.githubusercontent.com/gevartrix/basic-booking-ui5/master/assets/admin_panel.png?raw=true)

</details>

## Quick Start

First, clone this repository:

```sh
git clone https://github.com/gevartrix/basic-booking-ui5.git
```

For the sake of convenience all required environment variables for the server are stored in a `.env` file. The `server` folder contains a [.env.dist](server/.env.dist) file. Copy it to `server/.env` file and set its values accordingly.

Please make sure you've got a MongoDB database set.

Go inside the root directory:
```sh
cd basic-booking-ui5
```

Install dependencies:
```sh
npm install
npm run install-deps
```

Start the development server:
```sh
npm run dev
```

The application should then open in your default browser automatically.

You are also welcome to checkout the server's auto-generated API documentation by following the link bellow:
```
http://localhost:{SERVER_PORT}/api/docs
```

## Contributing

If you'd like to contribute to this little project, please follow these steps:

1. [Fork this repository](https://github.com/gevartrix/basic-booking-ui5/fork).
2. Create a branch: `git checkout -b feature/foo`.
3. Make your changes and commit them: `git commit -am 'Add foo feature'`.
4. Push your changes to the branch: `git push origin feature/foo`.
5. Create a new pull request.

__Pull requests are warmly welcome!__

### Style Guide

This application is configured with [ESLint](https://eslint.org/) as well as a set of rules for the [prettier](https://prettier.io/) code formatter. You may also check the configuration in the [.eslintrc.json](.eslintrc.json) and [.prettierrc.json](.prettierrc.json) files.

Therefore it is recommended to format the code before committing changes by running the following scripts from the root folder:
```sh
npx eslint . --fix
npm run prettify
```

## License

Copyright (c) 2020-2021 Artemy Gevorkov. This project is licensed under the [Apache Software License, version 2.0](LICENSE).
