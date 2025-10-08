class ErrHandler extends Error {
    statusCode = 0
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
    }
}

module.exports = ErrHandler