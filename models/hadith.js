const mongoose = require('mongoose'); 

const hadithSchema = new mongoose.Schema({
    metadata: {
      id: Number,
      length: Number,
      arabic: {
        title: String,
        author: String,
        introduction: String,
      },
      english: {
        title: String,
        author: String,
        introduction: String,
      },
    },
    chapters: [
      {
        id: Number,
        bookId: Number,
        arabic: String,
        english: String,
      },
    ],
    hadiths: [
      {
        id: Number,
        idInBook: Number,
        chapterId: Number,
        bookId: Number,
        arabic: String,
        english: {
          narrator: String,
          text: String,
        },
      },
    ],
  });
  
  const Hadith = mongoose.model('Hadith', hadithSchema);
  module.exports = Hadith;

