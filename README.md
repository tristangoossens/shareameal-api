## ShareAMeal-api ![heroku workflow](https://github.com/tristangoossens/shareameal-api/actions/workflows/deploy.yml/badge.svg) ![test workflow](https://github.com/tristangoossens/shareameal-api/actions/workflows/test.yml/badge.svg)

A small REST-api made with [NodeJS](https://nodejs.org/en/)  


### Features
This API includes the following features

- [x] GET, POST, PUT, DELETE methods for meals and users
- [x] JWT validation
- [x] Request validation
- [x] Persistency with a MySQL database
- [x] Integration tests for all routes and use cases

### Prerequisites
**This API requires [NodeJS](https://nodejs.org/en/) and a [local MySQL server](https://www.apachefriends.org/index.html) to execute**

### Installation
To install this project start by cloning the project in a shell window:

```sh
git clone https://github.com/tristangoossens/shareameal-api.git
```

Then install npm dependencies by running the following command:

```sh
npm i
```

### Using the API
The API can be executed by running the following command:

```sh
npm run start
```

### Testing the API
The API can be tested by running the following command:

```sh
npm run test
```

