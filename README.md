# College Canteen Menu REST API

## 1. Project Overview

Build a simple REST API for managing a college canteen menu using Node.js 22 and Express.js.

Each dish contains:
- `id` – Unique dish ID
- `name` – Dish name
- `price` – Price in rupees
- `available` – Whether the dish is available

The application uses `fs/promises` to save dish information in a JSON file so data remains available after restarting the server.

## 2. Technologies Used

- Node.js 22
- Express.js
- JavaScript
- File System (`fs/promises`)
- JSON
- curl
- Git and GitHub

## 3. Project Setup

Create a Git branch:

```bash
git checkout -b college-canteen-menu-api
```

Install Express:

```bash
npm install express
```

## 4. Sample Data

Create `data/dishes.json`:

```json
[
  {
    "id": "1",
    "name": "Masala Dosa",
    "price": 60,
    "available": true
  },
  {
    "id": "2",
    "name": "Veg Sandwich",
    "price": 50,
    "available": true
  },
  {
    "id": "3",
    "name": "Paneer Thali",
    "price": 120,
    "available": false
  }
]
```

## 5. Server Implementation

Create `server.js`:

```javascript
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "dishes.json");

let dishes = [];

// Load dishes from JSON file
async function loadDishes() {
    await fs.mkdir(dataDirectory, { recursive: true });

    const fileData = await fs.readFile(dataFile, "utf8");
    const parsedData = JSON.parse(fileData);

    if (!Array.isArray(parsedData)) {
        throw new Error("dishes.json must contain an array");
    }

    dishes = parsedData;
    console.log(`${dishes.length} dishes loaded successfully.`);
}

// Save dishes to JSON file
async function saveDishes(updatedDishes) {
    const temporaryFile = `${dataFile}.tmp`;

    await fs.writeFile(
        temporaryFile,
        JSON.stringify(updatedDishes, null, 2),
        "utf8"
    );

    await fs.rename(temporaryFile, dataFile);
}

// Validate dish name
function isValidName(name) {
    return typeof name === "string" && name.trim().length > 0;
}

// Validate dish price
function isValidPrice(price) {
    return (
        typeof price === "number" &&
        Number.isFinite(price) &&
        price >= 0
    );
}

// GET /dishes - List all dishes
app.get("/dishes", (req, res) => {
    res.status(200).json({
        success: true,
        count: dishes.length,
        data: dishes
    });
});

// GET /dishes/:id - Get one dish
app.get("/dishes/:id", (req, res) => {
    const dish = dishes.find(item => item.id === req.params.id);

    if (!dish) {
        return res.status(404).json({
            success: false,
            message: "Dish not found"
        });
    }

    res.status(200).json({
        success: true,
        data: dish
    });
});

// POST /dishes - Create a dish
app.post("/dishes", async (req, res, next) => {
    try {
        const { name, price, available } = req.body || {};

        if (!isValidName(name)) {
            return res.status(400).json({
                success: false,
                message: "Dish name cannot be empty"
            });
        }

        if (!isValidPrice(price)) {
            return res.status(400).json({
                success: false,
                message: "Price must be a non-negative number"
            });
        }

        if (
            available !== undefined &&
            typeof available !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "Available must be true or false"
            });
        }

        const highestId = dishes.reduce(
            (max, dish) => Math.max(max, Number(dish.id) || 0),
            0
        );

        const newDish = {
            id: String(highestId + 1),
            name: name.trim(),
            price,
            available: available === undefined ? true : available
        };

        const updatedDishes = [...dishes, newDish];

        await saveDishes(updatedDishes);
        dishes = updatedDishes;

        res.status(201).json({
            success: true,
            message: "Dish created successfully",
            data: newDish
        });
    } catch (error) {
        next(error);
    }
});

// PUT /dishes/:id - Update a dish
app.put("/dishes/:id", async (req, res, next) => {
    try {
        const dishIndex = dishes.findIndex(
            item => item.id === req.params.id
        );

        if (dishIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Dish not found"
            });
        }

        const { name, price, available } = req.body || {};

        if (
            name === undefined &&
            price === undefined &&
            available === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update"
            });
        }

        if (name !== undefined && !isValidName(name)) {
            return res.status(400).json({
                success: false,
                message: "Dish name cannot be empty"
            });
        }

        if (price !== undefined && !isValidPrice(price)) {
            return res.status(400).json({
                success: false,
                message: "Price must be a non-negative number"
            });
        }

        if (
            available !== undefined &&
            typeof available !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "Available must be true or false"
            });
        }

        const updatedDish = {
            ...dishes[dishIndex],
            ...(name !== undefined && { name: name.trim() }),
            ...(price !== undefined && { price }),
            ...(available !== undefined && { available })
        };

        const updatedDishes = [...dishes];
        updatedDishes[dishIndex] = updatedDish;

        await saveDishes(updatedDishes);
        dishes = updatedDishes;

        res.status(200).json({
            success: true,
            message: "Dish updated successfully",
            data: updatedDish
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /dishes/:id - Delete a dish
app.delete("/dishes/:id", async (req, res, next) => {
    try {
        const dish = dishes.find(item => item.id === req.params.id);

        if (!dish) {
            return res.status(404).json({
                success: false,
                message: "Dish not found"
            });
        }

        const updatedDishes = dishes.filter(
            item => item.id !== req.params.id
        );

        await saveDishes(updatedDishes);
        dishes = updatedDishes;

        res.status(200).json({
            success: true,
            message: "Dish deleted successfully",
            data: dish
        });
    } catch (error) {
        next(error);
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Handle errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body"
        });
    }

    console.error("API error:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Start server after loading data
async function startServer() {
    try {
        await loadDishes();

        app.listen(PORT, () => {
            console.log(`Canteen API running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start server:", error.message);
        process.exit(1);
    }
}

startServer();
```

## 6. Request Script

Create `requests.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. GET all dishes"
curl -i "$BASE_URL/dishes"
echo -e "\n\n"

echo "2. GET one dish"
curl -i "$BASE_URL/dishes/1"
echo -e "\n\n"

echo "3. POST create a dish"
POST_RESPONSE=$(curl -sS -X POST "$BASE_URL/dishes" \
-H "Content-Type: application/json" \
-d '{"name":"Veg Biryani","price":100,"available":true}')

echo "$POST_RESPONSE"

DISH_ID=$(printf '%s' "$POST_RESPONSE" | node -pe \
'JSON.parse(require("fs").readFileSync(0, "utf8")).data.id')

echo -e "\n\n"

echo "4. PUT update the dish"
curl -i -X PUT "$BASE_URL/dishes/$DISH_ID" \
-H "Content-Type: application/json" \
-d '{"name":"Special Veg Biryani","price":130,"available":true}'
echo -e "\n\n"

echo "5. DELETE the dish"
curl -i -X DELETE "$BASE_URL/dishes/$DISH_ID"
echo -e "\n\n"

echo "All five routes tested."
```

Make the script executable:

```bash
chmod +x requests.sh
```

## 7. API Testing

Start the server:

```bash
node server.js
```

Run the requests from another Terminal window:

```bash
./requests.sh
```

### GET all dishes

```bash
curl -i http://localhost:3000/dishes
```

Expected status: 200 OK.

### GET dish by ID

```bash
curl -i http://localhost:3000/dishes/1
```

Expected status: 200 OK.

### POST create a dish

```bash
curl -i -X POST http://localhost:3000/dishes \
-H "Content-Type: application/json" \
-d '{"name":"Veg Biryani","price":100,"available":true}'
```

Expected status: 201 Created.

Example response:

```json
{
  "success": true,
  "message": "Dish created successfully",
  "data": {
    "id": "4",
    "name": "Veg Biryani",
    "price": 100,
    "available": true
  }
}
```

### PUT update a dish

```bash
curl -i -X PUT http://localhost:3000/dishes/4 \
-H "Content-Type: application/json" \
-d '{"name":"Special Veg Biryani","price":130,"available":true}'
```

Expected status: 200 OK.

### DELETE a dish

```bash
curl -i -X DELETE http://localhost:3000/dishes/4
```

Expected status: 200 OK.

## 8. Error Handling Tests

### Test missing dish ID

```bash
curl -i http://localhost:3000/dishes/999
```

Expected status: 404 Not Found.

### Test empty dish name

```bash
curl -i -X POST http://localhost:3000/dishes \
-H "Content-Type: application/json" \
-d '{"name":"","price":50,"available":true}'
```

Expected status: 400 Bad Request.

## 9. Data Persistence Test

1. Add a new dish using POST.
2. Check that the dish is stored in `data/dishes.json`.
3. Stop the server using Control + C.
4. Restart the server using `node server.js`.
5. Retrieve the dish using its ID.

Example:

```bash
curl http://localhost:3000/dishes/4
```

The dish should still be available after restarting the server.

## 10. REVIEW.md – Testing Results

Create `REVIEW.md` and paste your actual curl or Thunder Client requests and responses.

Include these six tests:

1. GET `/dishes`
2. GET `/dishes/1`
3. POST `/dishes`
4. PUT `/dishes/4`
5. DELETE `/dishes/4`
6. GET the newly created dish after restarting the server

Also include the 404 missing ID and 400 empty-name tests.

**Important:** Paste the real terminal responses. The examples in this README are expected responses, not proof that the tests were executed.

## 11. How to Run the Project

Install dependencies:

```bash
npm install
npm install express
```

Start the server:

```bash
node server.js
```

Run the API request script from another Terminal:

```bash
chmod +x requests.sh
./requests.sh
```

## 12. What I Learned

- How to create REST APIs using Node.js and Express.js.
- How to implement GET, POST, PUT and DELETE routes.
- How to read and write JSON files using `fs/promises`.
- How to save data permanently after API operations.
- How to validate input and return appropriate HTTP status codes.
- How to test API endpoints using curl.
- How to create Git branches and submit changes through pull requests.

## 13. GitHub Submission

Create a dedicated branch:

```bash
git checkout -b college-canteen-menu-api
```

Check the changes:

```bash
git status
```

Add the required files:

```bash
git add server.js data/dishes.json requests.sh REVIEW.md README.md package.json package-lock.json
```

Commit:

```bash
git commit -m "Build persistent college canteen menu API"
```

Push:

```bash
git push -u origin college-canteen-menu-api
```

## 14. Create Pull Request

1. Open your GitHub repository.
2. Select the `college-canteen-menu-api` branch.
3. Click Compare & pull request.
4. Set the base branch to `main`.
5. Set the compare branch to `college-canteen-menu-api`.
6. Title: `Build College Canteen Menu REST API`.
7. Describe the five routes and JSON persistence.
8. Create the pull request.
9. Review and merge it into `main`.

## 15. Conclusion

This project demonstrates how to develop a simple college canteen REST API using Node.js 22 and Express.js.

It supports all five CRUD operations and uses `fs/promises` to persist dish data in a JSON file. The API also validates dish names, handles missing IDs and returns appropriate HTTP status codes.

The request script and testing documentation make it easier to verify that all API routes work correctly.
