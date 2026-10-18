# Dungeon Notes API
I'm learning how to build APIs.

## Installation
### 1. Clone the Repository
```
git clone https://github.com/BeckyPollard/100996193_COMP3123_Assignment1.git
```

### 2. Install Project Dependencies
```
npm i
```

### 3. Configure Environment Variables
Create a file named `.env` in the root folder of the project and enter your credentials à la `.env.example`:

### 4. Run the Application
Dev Mode - Auto-Refreshing on file change with Nodemon
```
npm run dev
```
Production/Standard Mode
```
npm start
```

### 5. Voilà

Verify:
* the log message `[SERVER] HELL YEAH! Application running on port PORT` outputs to your console terminal.
* the log message `[[SERVER] Success connect to mongoDB atlas server yahoo` outputs to your console terminal.

...and you're ready to go!

## Configuration
This project needs a file for environment variables `.env`

```
MONGODB_URI=___________________________________
JWT_SECRET=____________________________________
PORT=3000
ENV=development
```

You can create a strong JWT_SECRET key by running `node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"` in your terminal and copying the result into the `JWT_SECRET` variable.

## API
API requests must use the following base URL paths:
* User Accounts: /api/v0/user
* Character Management: /api/v0/character
* System Health: /api/v1
