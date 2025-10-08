const { Prisma } = require("@prisma/client")
const ErrHandler = require("../utils/error.util")

module.exports = (err, req, res, next) => {
    console.error(err.message)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            res.status(400).json({
                success: false,
                statusCode: 400,
                message: `Error Request on ${err.meta.target}`,
            })
        }
    }
    if (err instanceof ErrHandler) {
        res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
        })
    } else {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: err.message,
        })
    }
}