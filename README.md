# Products API – JSON File Persistence

## 1. Project Overview

This project implements a Products CRUD REST API using Node.js and Express.js.

Product data is stored permanently in a JSON file instead of an in-memory array.

### Technologies
- Node.js
- Express.js
- File System (`fs/promises`)
- JSON
- curl
- Git and GitHub

## 2. Project Setup

Create a new branch:

```bash
git checkout -b products-json-persistence
```

Install Express if it is not already installed:

```bash
npm install express
```

## 3. Initial Product Data

Create `data/products.json`:

```json
[
  {
    "id": "1",
    "name": "Cricket Bat",
    "price": 1500,
    "category": "Sports"
  },
  {
    "id": "2",
    "name": "Cricket Ball",
    "price": 250,
    "category": "Sports"
  },
  {
    "id": "3",
    "name": "Cricket Gloves",
    "price": 800,
    "category": "Accessories"
  }
]
```

## 4. Products API Implementation

Create `products-api.js`:

```javascript
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(express.json());

const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "products.json");

let products = [];

// Load products from JSON file
const loadProducts = async () => {
    await fs.mkdir(dataDirectory, { recursive: true });

    try {
        const fileData = await fs.readFile(dataFile, "utf8");
        products = JSON.parse(fileData);

        if (!Array.isArray(products)) {
            throw new Error("Products JSON must contain an array");
        }

        console.log(`${products.length} products loaded successfully.`);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }

        products = [
            { id: "1", name: "Cricket Bat", price: 1500, category: "Sports" },
            { id: "2", name: "Cricket Ball", price: 250, category: "Sports" },
            { id: "3", name: "Cricket Gloves", price: 800, category: "Accessories" }
        ];

        await saveProducts();
    }
};

// Save products to JSON file
const saveProducts = async () => {
    const temporaryFile = `${dataFile}.tmp`;

    await fs.writeFile(
        temporaryFile,
        JSON.stringify(products, null, 2),
        "utf8"
    );

    await fs.rename(temporaryFile, dataFile);
};

// GET all products
app.get("/products", (req, res) => {
    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// GET product by ID
app.get("/products/:id", (req, res) => {
    const product = products.find(
        item => item.id === req.params.id
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// POST create product
app.post("/products", async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Request body must be a JSON object"
            });
        }

        const { name, price, category } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid name and non-negative price are required"
            });
        }

        const highestId = products.reduce(
            (max, item) => Math.max(max, Number(item.id) || 0),
            0
        );

        const newProduct = {
            id: String(highestId + 1),
            name: name.trim(),
            price: Number(price),
            category: typeof category === "string" && category.trim()
                ? category.trim()
                : "General"
        };

        products.push(newProduct);
        await saveProducts();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });
    } catch (error) {
        next(error);
    }
});

// PUT update product
app.put("/products/:id", async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Request body must be a JSON object"
            });
        }

        const product = products.find(
            item => item.id === req.params.id
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const { name, price, category } = req.body;

        if (name === undefined && price === undefined && category === undefined) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update"
            });
        }

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name must be a non-empty string"
                });
            }
            product.name = name.trim();
        }

        if (price !== undefined) {
            if (
                price === null ||
                price === "" ||
                !Number.isFinite(Number(price)) ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Price must be a non-negative number"
                });
            }
            product.price = Number(price);
        }

        if (category !== undefined) {
            if (typeof category !== "string" || !category.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category must be a non-empty string"
                });
            }
            product.category = category.trim();
        }

        await saveProducts();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
});

// DELETE product
app.delete("/products/:id", async (req, res, next) => {
    try {
        const productIndex = products.findIndex(
            item => item.id === req.params.id
        );

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const deletedProduct = products[productIndex];

        products.splice(productIndex, 1);
        await saveProducts();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: deletedProduct
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

    console.error(err.message);

    res.status(500).json({
        success: false,
        message: "Unable to process request"
    });
});

// Start server after loading data
const startServer = async () => {
    try {
        await loadProducts();

        app.listen(PORT, () => {
            console.log(`Products API running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
```

## 5. Request Script

Create `requests.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "1. GET all products"
curl -sS "$BASE_URL/products"
echo -e "\n\n"

echo "2. GET product by ID"
curl -sS "$BASE_URL/products/2"
echo -e "\n\n"

echo "3. POST create product"
POST_RESPONSE=$(curl -sS -X POST "$BASE_URL/products" \
-H "Content-Type: application/json" \
-d '{"name":"Test Cricket Kit","price":2000,"category":"Sports"}')

echo "$POST_RESPONSE"

PRODUCT_ID=$(printf '%s' "$POST_RESPONSE" | node -pe \
'JSON.parse(require("fs").readFileSync(0, "utf8")).data.id')

echo -e "\n\n"

echo "4. PUT update product"
curl -sS -X PUT "$BASE_URL/products/$PRODUCT_ID" \
-H "Content-Type: application/json" \
-d '{"name":"Updated Cricket Kit","price":2500}'
echo -e "\n\n"

echo "5. DELETE product"
curl -sS -X DELETE "$BASE_URL/products/$PRODUCT_ID"
echo -e "\n\n"

echo "All five API requests completed."
```

Make it executable:

```bash
chmod +x requests.sh
```

## 6. Start and Test the Server

Start the server:

```bash
node products-api.js
```

Open another Terminal window and execute:

```bash
./requests.sh
```

### GET all products

```bash
curl http://localhost:3001/products
```

Expected status: 200 OK.

### GET product by ID

```bash
curl http://localhost:3001/products/2
```

Expected status: 200 OK.

### POST a product

```bash
curl -X POST http://localhost:3001/products \
-H "Content-Type: application/json" \
-d '{"name":"Persistent Cricket Bat","price":3500,"category":"Sports"}'
```

Expected status: 201 Created.

Example response:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "4",
    "name": "Persistent Cricket Bat",
    "price": 3500,
    "category": "Sports"
  }
}
```

### PUT update product

```bash
curl -X PUT http://localhost:3001/products/4 \
-H "Content-Type: application/json" \
-d '{"name":"Premium Cricket Bat","price":4000}'
```

Expected status: 200 OK.

### DELETE product

```bash
curl -X DELETE http://localhost:3001/products/4
```

Expected status: 200 OK.

## 7. Test Data Persistence After Restart

First, add a product:

```bash
curl -X POST http://localhost:3001/products \
-H "Content-Type: application/json" \
-d '{"name":"Persistent Cricket Bat","price":3500,"category":"Sports"}'
```

Check that the product is saved in `data/products.json`.

Stop the server using Control + C.

Restart the server:

```bash
node products-api.js
```

Retrieve the product using its actual ID:

```bash
curl http://localhost:3001/products/4
```

Example response after restart:

```json
{
  "success": true,
  "data": {
    "id": "4",
    "name": "Persistent Cricket Bat",
    "price": 3500,
    "category": "Sports"
  }
}
```

**Result:** The product remains available after restarting the server because the data is saved in the JSON file.

## 8. Review and Testing Results

### Test 1: GET all products

Request:

```bash
curl http://localhost:3001/products
```

Response:

Paste your actual terminal output here.

### Test 2: GET product by ID

Request:

```bash
curl http://localhost:3001/products/2
```

Response:

Paste your actual terminal output here.

### Test 3: POST product

Request:

```bash
curl -X POST http://localhost:3001/products \
-H "Content-Type: application/json" \
-d '{"name":"Persistent Cricket Bat","price":3500,"category":"Sports"}'
```

Response:

Paste your actual terminal output here.

### Test 4: PUT product

Request:

```bash
curl -X PUT http://localhost:3001/products/4 \
-H "Content-Type: application/json" \
-d '{"name":"Premium Cricket Bat","price":4000}'
```

Response:

Paste your actual terminal output here.

### Test 5: DELETE product

Request:

```bash
curl -X DELETE http://localhost:3001/products/4
```

Response:

Paste your actual terminal output here.

### Test 6: Persistence after restart

Request after restarting the server:

```bash
curl http://localhost:3001/products/4
```

Response:

Paste your actual terminal output here.

The product should still be available after restarting the server.

## 9. How to Run the Project

Install dependencies:

```bash
npm install
```

Start the API:

```bash
node products-api.js
```

Run all API requests from another Terminal window:

```bash
chmod +x requests.sh
./requests.sh
```

## 10. GitHub Submission

Create the branch:

```bash
git checkout -b products-json-persistence
```

Check your changes:

```bash
git status
```

Add and commit your work:

```bash
git add products-api.js data/products.json requests.sh README.md REVIEW.md
git commit -m "Add JSON file persistence for products API"
```

Push to GitHub:

```bash
git push -u origin products-json-persistence
```

## 11. Conclusion

This assignment demonstrates how to build a CRUD REST API with Express.js and persist data using Node.js file-system operations.

The application loads product records from a JSON file at startup and saves changes after every POST, PUT, and DELETE request.

The curl request script makes API testing easier, and the restart test confirms that product information is preserved.
