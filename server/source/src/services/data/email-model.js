const mongoose = require("mongoose");

const emailSchema = mongoose.Schema({
    to: [{
        type: String,
        required: true
    }],
    cc: {
        type: String,
        required: false,
    },
    bcc: {
        type: String,
        required: false,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Email", emailSchema);