// controllers/hadithController.js
const Hadith = require('../models/hadith');

// Fetch all Hadiths with optional pagination
exports.getAllHadiths = async (req, res) => {
    try {
      const { page = 1, limit = 10, sort = 'id' } = req.query; // Add sort parameter
      const hadiths = await Hadith.find()
        .sort(sort) // Apply sorting
        .skip((page - 1) * limit)
        .limit(limit);
      res.status(200).json({ status: 'success', data: hadiths });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  };

// Fetch Hadiths by book
exports.getHadithsByBook = async (req, res) => {
    try {
      const { bookName } = req.params;
  
      console.log("Requested book name:", bookName);
  
      // Debug: List all book titles
      const allBooks = await Hadith.find({}, { "metadata.english.title": 1 });
      console.log("Available book titles:", allBooks);
  
      // Find the book
      const book = await Hadith.findOne({
        "metadata.english.title": { $regex: `^${bookName}$`, $options: "i" },
      });
  
      console.log("Query result:", book);
  
      if (!book) {
        return res.status(404).json({
          status: "fail",
          message: `Book not found: ${bookName}`,
        });
      }
  
      res.status(200).json({
        status: "success",
        data: book,
      });
    } catch (err) {
      console.error("Error:", err.message);
      res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  };
  
  
// Search Hadiths by text or filter by narrator
exports.searchHadiths = async (req, res) => {
  try {
    const { query, narrator } = req.query;
    const searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { arabic: { $regex: query, $options: 'i' } },
        { english: { $regex: query, $options: 'i' } },
      ];
    }

    
    if (narrator) {
        searchCriteria.narrator = { $regex: narrator, $options: 'i' };
      }
      

    const hadiths = await Hadith.find(searchCriteria);
    const { limit = 10 } = req.query;
    const pageLimit = Math.min(limit, 100); // Cap at 100 records per request

    res.status(200).json({ status: 'success', data: hadiths });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
