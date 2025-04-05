const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

async function findRelevantHadiths(question, hadiths, language = 'english') {
  // Charger le modèle Universal Sentence Encoder
  const model = await use.load();

  // Encoder la question
  const questionEmbedding = await model.embed([question]);

  // Encoder tous les hadiths
  const hadithTexts = hadiths.map((hadith) =>
    language === 'arabic' ? hadith.arabic : hadith.english.text
  );
  const hadithEmbeddings = await model.embed(hadithTexts);

  // Calculer la similarité cosinus entre la question et les hadiths
  const similarities = [];
  for (let i = 0; i < hadithEmbeddings.shape[0]; i++) {
    const similarity = tf.matMul(questionEmbedding, hadithEmbeddings.slice([i, 0], [1, 512]), true).dataSync()[0];
    similarities.push({ index: i, similarity });
  }

  // Trier les hadiths par similarité
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Récupérer les hadiths les plus pertinents (top 3)
  const topHadiths = similarities.slice(0, 3).map((score) => hadiths[score.index]);

  return topHadiths;
}

module.exports = { findRelevantHadiths };