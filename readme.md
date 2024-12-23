# BankSphere

This POC/project is under development.

## Project information

BankSphere POC is a project where I am exploring monorepos to manage multiple applications, including web interfaces for bank admin, employees, and customers, as well as a mobile app for customers, all from a single repository.

### Day to day updates/tasks

`23rd December 2024`

-   Sorted messages according to the type of message. Ex: Authorization, Errors etc. and updated the ErrorHandler logic accordingly.
-   Updated response handler for success messages logic.

`22nd December 2024`

-   Updated messages file with a centralized approach where messages for system and user are more clear.
-   Replaced error codes in all files
-   Updated global error handler to handle different kinds of error messages dynamically.

`21st December 2024`

-   Created a middleware for unknown routes.
-   Update rate limiter globally with role based approach.
-   Created a centralized error, success etc. messages file
-   Created a DB connection checking middleware, as well as API for system health check which stops any further operations if the DB is not connected
-   Added error.stack to trace the stack of errors which will only works in develpment mode.
-   Updated logger for more simple message logging as well as added loggers in various places to trace the logs.
-   Added different kinds of security mechanism is the header using CORS and helmet.

`20th December 2024`

-   Created a logger for logging the api requests as well as errors, logs will saved inside logs folder, which will remove the logs automatically in 14 days.
-   Created a api requests rate limiter which will logs certain api's after continue calls , it's a role based limiter.

`19th December 2024`

-   Created services layer which will handle the core logic of the api's and shifted all logic from controller to service layer.
-   Created a global validation handler.

`17th December 2024`

-   Added role handlers for different kind of role (Ex: employee,admin,customer).
-   Added token verification handlder.
-   Created a global custom error handler which formats the erros in same format, as well as created a custom response handler to send the responses in the same format.

`16th December 2024`

Created a common authentication system for customer,employee and admin with token generation.Also finsihed integration postgreSQL as a database and prisma as a type ORM.

`14th December 2024`

-   Created a basic monorepo structure which have a apps directory for the all backend, employee ui, admin ui etc codebase.
-   Created a centralized packages folder which will contain all utilities, global configurations, ui library setups.

#### Libraries

| Package                                                                              | Description                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| NodeJS                                                                               | Javascript runtime environment                    |
| ExpressJS                                                                            | Framework for nodejs                              |
| Prisma                                                                               | A ORM tool for database schemas and relationships |
| @prisma/client                                                                       | Auto generated query builder                      |
| PostgreSQL                                                                           | Database                                          |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)                           | Token generator                                   |
| [joi](https://www.npmjs.com/package/joi)                                             | Data validator                                    |
| [winston](https://www.npmjs.com/package/winston)                                     | Logging library                                   |
| [morgan](https://www.npmjs.com/package/morgan)                                       | HTTP request logger middleware for node.js        |
| [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)               | Basic rate-limiting middleware for Express        |
| [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file) | Log file rotator                                  |

### Tech Stack

#### FrontEnd

-   ReactJS
-   Vite
-   Bootstrap

#### BackEnd

-   NodeJS
-   ExpressJS
-   Prisma
-   PostgreSQL

### .prettierrc

Styling changes for clean code.

### .eslintrc.json

Linting configuration to use standard code conventions and styles.

### IMPORTANT NOTES

#### Creating a prisma setup

1. Setting Up Prisma with PostgreSQL

Install Prisma, run the following commands to set up Prisma in your project:

```javascript
    npm install prisma --save-dev
    npx prisma init
```

2. Configure PostgreSQL in schema.prisma

Update the datasource block in schema.prisma with your PostgreSQL connection URL:

```javascript
    datasource db {
    provider = "postgresql"
    url = env("DATABASE_URL")
    }

    generator client {
    provider = "prisma-client-js"
    }
```

3. Ensure your .env file contains the DATABASE_URL:

```javascript
DATABASE_URL = 'postgresql://<username>:<password>@<host>:<port>/<database>?schema=public';
```

4. Define the models

```javascript
    model User {
    id Int @id @default(autoincrement())
    name String
    email String @unique
    password String
    role Role
    createdAt DateTime @default(now())
    }

    enum Role {
    admin
    employee
    customer
    }
```

5. Use following commands to apply schema changes to database.

```javascript
    npx prisma migrate dev --name init
    npx prisma generate
```

# Security management for BankSphere

| Header Name                      | Syntax                                                                           | Explanation                                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy          | `default-src 'self'; script-src 'self'; style-src 'self' https: 'unsafe-inline'` | Prevents XSS attacks by controlling which resources can be loaded. Restricts content sources to same origin with some exceptions for styles.         |
| Cross-Origin-Embedder-Policy     | `require-corp`                                                                   | Prevents loading of cross-origin resources that don't explicitly grant permission. Enhances isolation of your web application.                       |
| Cross-Origin-Opener-Policy       | `same-origin`                                                                    | Controls how your document interacts with other browsing contexts. Prevents other origins from opening/controlling your window.                      |
| Cross-Origin-Resource-Policy     | `same-origin`                                                                    | Prevents other websites from embedding your resources. Protects against various cross-origin attacks.                                                |
| Strict-Transport-Security        | `max-age=15552000; includeSubDomains`                                            | Forces browsers to use HTTPS for future visits. Prevents downgrade attacks and cookie hijacking for 180 days.                                        |
| X-Content-Type-Options           | `nosniff`                                                                        | Prevents browsers from MIME-sniffing responses away from declared content-type. Stops content-sniffing attacks that could execute malicious content. |
| X-Frame-Options                  | `DENY`                                                                           | Prevents your page from being displayed in an iframe. Protects against clickjacking attacks.                                                         |
| X-XSS-Protection                 | `1; mode=block`                                                                  | Enables browser's XSS filtering. Stops pages from loading when XSS attacks are detected.                                                             |
| Cache-Control                    | `no-store, no-cache, must-revalidate, private`                                   | Prevents caching of sensitive data. Forces fresh content fetch on each request.                                                                      |
| Pragma                           | `no-cache`                                                                       | Legacy HTTP/1.0 way to specify no-caching. Included for backward compatibility with older browsers.                                                  |
| Expires                          | `0`                                                                              | Forces immediate expiration of cached content. Ensures fresh content is always fetched from server.                                                  |
| X-Content-Security-Policy        | `default-src 'none'`                                                             | Legacy header for older browsers. Provides additional layer of security for API responses.                                                           |
| Access-Control-Allow-Origin      | `http://localhost:3000`                                                          | Specifies which origins can access the resource. Part of CORS security implementation.                                                               |
| Access-Control-Allow-Credentials | `true`                                                                           | Allows authenticated requests to be made using credentials. Required for sessions/cookies in CORS requests.                                          |
| Access-Control-Expose-Headers    | `X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset`                    | Makes specified headers accessible to client. Allows frontend to access rate limiting information.                                                   |
| X-RateLimit-Limit                | `7`                                                                              | Specifies maximum number of requests allowed. Part of rate limiting implementation to prevent abuse.                                                 |
| X-RateLimit-Remaining            | `6`                                                                              | Shows number of requests remaining in current time window. Helps clients track their API usage.                                                      |
| X-RateLimit-Reset                | `1734764262`                                                                     | Unix timestamp when the rate limit window resets. Allows clients to know when they can make requests again.                                          |

## Usage Notes:

-   Headers are applied globally via Helmet middleware
-   Additional custom headers are set via middleware
-   CORS headers are managed by cors middleware
-   Rate limiting headers are set by rate limiter middleware

## Implementation Example:

```javascript
app.use(helmet()); // Applies most security headers

app.use((req, res, next) => {
    // Additional custom headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    next();
});
```
