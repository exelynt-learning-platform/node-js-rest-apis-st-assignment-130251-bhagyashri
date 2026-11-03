
const express = require("express");

const app = express();
const PORT = 3001;

// Parse incoming JSON request bodies
app.use(express.json());

// In-memory product data
let products = [
    { id: "1", name: "Cricket Bat", price: 1500, category: "Sports" },
    { id: "2", name: "Cricket Ball", price: 250, category: "Sports" },
    { id: "3", name: "Cricket Gloves", price: 800, category: "Accessories" }
];

let nextId = 4;

// GET /products - Get all products
app.get("/products", (req, res) => {
    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// GET /products/:id - Get one product
app.get("/products/:id", (req, res) => {
    const product = products.find(
        (item) => item.id === req.params.id
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

// POST /products - Add a new product
app.post("/products", (req, res) => {
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
            message: "A valid product name and non-negative price are required"
        });
    }

    const newProduct = {
        id: String(nextId++),
        name: name.trim(),
        price: Number(price),
        category: typeof category === "string" ? category.trim() : "General"
    };

    products.push(newProduct);

    res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct
    });
});

// PUT /products/:id - Update a product
app.put("/products/:id", (req, res) => {
    const product = products.find(
        (item) => item.id === req.params.id
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    const { name, price, category } = req.body;

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

    if (
        name === undefined &&
        price === undefined &&
        category === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one field to update"
        });
    }

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product
    });
});

// DELETE /products/:id - Delete a product
app.delete("/products/:id", (req, res) => {
    const productIndex = products.findIndex(
        (item) => item.id === req.params.id
    );

    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: deletedProduct
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Handle invalid JSON and other Express errors
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
        message: "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Products API running at http://localhost:${PORT}`);
});
