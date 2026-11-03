
const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// GET / - Home route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome, cricket fans"
    });
});

// GET /shop - Return shop details
app.get("/shop", (req, res) => {
    res.status(200).json({
        success: true,
        shopName: "Cricket Sports Store",
        city: "Mumbai"
    });
});

// GET /products/:name - Get product name from URL
app.get("/products/:name", (req, res) => {
    const productName = req.params.name;

    if (!productName || !productName.trim()) {
        return res.status(400).json({
            success: false,
            message: "Product name is required"
        });
    }

    res.status(200).json({
        success: true,
        message: `Product selected: ${productName}`,
        productName: productName
    });
});

// GET /discount - Calculate discounted price
app.get("/discount", (req, res) => {
    const { price, percent } = req.query;

    const originalPrice = Number(price);
    const discountPercent = Number(percent);

    if (
        price === undefined ||
        percent === undefined ||
        price.trim() === "" ||
        percent.trim() === "" ||
        !Number.isFinite(originalPrice) ||
        !Number.isFinite(discountPercent) ||
        originalPrice < 0 ||
        discountPercent < 0 ||
        discountPercent > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "Provide a valid price and a discount percent between 0 and 100"
        });
    }

    const discountAmount = originalPrice * discountPercent / 100;
    const finalPrice = Number((originalPrice - discountAmount).toFixed(2));

    res.status(200).json({
        success: true,
        originalPrice,
        discountPercent,
        discountAmount: Number(discountAmount.toFixed(2)),
        finalPrice
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
