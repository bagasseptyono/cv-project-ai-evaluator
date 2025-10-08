require("dotenv").config();
const express = require("express");
const config = require("./src/config/app.config");
const errHandlerMiddleware = require("./src/middlewares/errHandler.middleware");
const apiRoute = require("./src/routers/index");

const app = express();

app.use(express.json());

app.use('/api/v1', apiRoute);
app.use('/public', express.static('public'));
app.use(errHandlerMiddleware);

app.use((req, res) => {
    const response = {
        status: 404,
        message: 'Not Found',
        data: null,
    };
    res.status(404).json(response);
});

// app.use(errHandlerMiddleware);

app.listen(config.PORT, () => {
    console.log(`App listening on port http://localhost:${config.PORT}`);
});