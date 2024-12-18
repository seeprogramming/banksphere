# BankSphere

This POC/project is under development.

## Project information

BankSphere POC is a project where I am exploring monorepos to manage multiple applications, including web interfaces for bank admin, employees, and customers, as well as a mobile app for customers, all from a single repository.

### Day to day updates/tasks

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

-   prisma (ORM)
-   PostgreQL (Database)
-   JWT

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
-   JWT

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
