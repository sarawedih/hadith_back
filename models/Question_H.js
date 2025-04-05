const mongoose = require("mongoose");

const questionHadithSchema = new mongoose.Schema({
    question: { type: String, required: true },
    choices: { type: [String], required: true },
    correct: { type: String, required: true },
    id: {type: Number, required: true}
});

module.exports = mongoose.model("Question_H", questionHadithSchema);
