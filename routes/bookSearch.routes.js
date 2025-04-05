const router = require('express').Router();
const BookSearchController = require('../controllers/bookSearch.controller');
const { validateBookId } = require('../middleware/validators');
const Hadith = require('../models/hadith'); // Import du modèle Hadith

// Route pour récupérer les informations d'un livre
router
  .route('/site/book/:id')
  .get(validateBookId, BookSearchController.getOneBookByIdUsingSiteDorar);

// Route pour récupérer les hadiths d'un livre

router.get('/site/book/:id/hadiths', async (req, res, next) => {
  // console.log('Début de la route'); // Log 1

  try {
    const bookId = parseInt(req.params.id);
    if (isNaN(bookId)) {
      // console.log('ID invalide'); // Log 3
      return res.status(400).json({ status: 'error', message: 'Invalid book ID' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    // console.log('Pagination - limit:', limit, 'offset:', offset); // Log 4

    const book = await Hadith.findOne(
      { 'metadata.id': bookId },
      { hadiths: { $slice: [offset, limit] } } // 🔥 MongoDB gère la pagination ici !
    );
    
    

    if (!book || !book.hadiths) { // Vérification supplémentaire
      console.log('Livre non trouvé ou sans hadiths'); // Log 6
      return res.status(404).json({ status: 'error', message: 'Book not found or has no hadiths' });
    }

    const paginatedHadiths = book.hadiths.slice(offset, offset + limit);
    // console.log('Hadiths paginés:', paginatedHadiths); // Log 7

    // Envoi unique de la réponse
    return res.status(200).json({
      status: 'success',
      data: paginatedHadiths,
      pagination: {
        total: book.hadiths.length,
        limit: limit,
        offset: offset,
      },
    });
  } catch (error) {
    console.error('Erreur:', error); // Log 8
    next(error); // Envoi de l'erreur au middleware d'erreur d'Express
  }
});

// Middleware d'erreur global pour capter toutes les erreurs
router.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  if (!res.headersSent) { // Vérifie si la réponse a déjà été envoyée
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// 🔍 Fonction pour nettoyer le texte arabe avant la recherche
function cleanText(text) {
  return text
    .replace(/[\u064B-\u065F]/g, '') // Supprime les harakat (diacritiques)
    .replace(/\s+/g, ' ') // Remplace plusieurs espaces par un seul
    .trim(); // Supprime espaces en début/fin
}


// 🔍 Route pour rechercher un mot ou une phrase dans un livre précis
router.get('/site/book/:id/hadiths/search', async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    const query = req.query.query?.trim();

    if (isNaN(bookId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid book ID' });
    }
    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Query parameter is required' });
    }

    const book = await Hadith.findOne({ 'metadata.id': bookId });

    if (!book) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    // console.log(`📖 Livre trouvé : ${book.metadata?.title || 'Unknown Title'} - Nombre de hadiths : ${book.hadiths.length}`);
    // console.log(`🔎 Recherche du mot/phrase : "${query}"`);

    // 🔍 Création de l'expression régulière pour la recherche (insensible à la casse)
    const searchRegex = new RegExp(query, 'i');

    // 🔍 Filtrer les hadiths contenant le mot/phrase
    const filteredHadiths = book.hadiths.filter(hadith => {
      if (!hadith) return false;

      const cleanArabicText = hadith.arabic ? cleanText(hadith.arabic) : '';
      const cleanEnglishText = hadith.english?.text ? cleanText(hadith.english.text) : '';

      const containsInArabic = searchRegex.test(cleanArabicText);
      const containsInEnglish = searchRegex.test(cleanEnglishText);

      // if (containsInArabic || containsInEnglish) {
      //   console.log('✅ Id Hadith trouvé:', hadith.idInBook);
      // }

      return containsInArabic || containsInEnglish;
    });

    if (filteredHadiths.length === 0) {
      // console.log('❌ Aucun hadith trouvé contenant:', query);
      return res.status(404).json({ status: 'error', message: 'No matching hadiths found' });
    }

    return res.json({ status: 'success', count: filteredHadiths.length, data: filteredHadiths });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});



// Export du routeur
module.exports = router;
