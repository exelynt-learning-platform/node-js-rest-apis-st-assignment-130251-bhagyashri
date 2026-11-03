# Node API Starter – Setup & Your First Server

## 1. Developer Information

- **Name:** YOUR_NAME
- **Favourite Cricket Player:** YOUR_FAVOURITE_PLAYER
- **Node.js Version:** v22.x.x
- **Port:** 3000

## 2. Node.js and VS Code Setup

Install Node.js 22 and Visual Studio Code.

Verify Node.js installation:

```bash
node -v
npm -v
```

Expected Node.js version: `v22.x.x`

## 3. Hello JavaScript

Create and run the JavaScript program:

```javascript
console.log("My name is YOUR_NAME");
console.log("My favourite cricket player is YOUR_FAVOURITE_PLAYER");
```

Run:

```bash
node hello.js
```

Expected output:

```text
My name is YOUR_NAME
My favourite cricket player is YOUR_FAVOURITE_PLAYER
```

## 4. Initialize Node.js Project

```bash
npm init -y
npm install express
```

## 5. Express Server

Create `server.js`:

```javascript
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
    res.status(200).send("Welcome, cricket fans");
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).send("Route not found");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
```

Run the server:

```bash
node server.js
```

Expected output:

```text
Server is running at http://localhost:3000
```

### API Testing

**Method:** GET

**URL:** http://localhost:3000/

**Expected Response:**

```text
Welcome, cricket fans
```

### Error Handling Test

**Method:** GET

**URL:** http://localhost:3000/invalid

**Expected Status:** 404 Not Found

**Response:**

```text
Route not found
```

## 6. GitHub Repository and Branch

Repository name: `node-api-starter`

Create an assignment branch:

```bash
git init
git checkout -b setup-first-express-server
```

Commit and push:

```bash
git add .
git commit -m "Complete Node.js setup and first Express server"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/node-api-starter.git
git push -u origin setup-first-express-server
```

## 7. Conclusion

This assignment demonstrates Node.js installation, executing JavaScript files, initializing an npm project, installing Express, creating a basic HTTP server, handling unknown routes, and pushing work to GitHub.
