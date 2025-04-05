const request = require('supertest');
const app = require('../app');
const Hadith = require('../models/hadith');

// Test de l'endpoint /api/chat
describe('POST /api/chat', () => {
  beforeAll(async () => {
    // Ajouter des hadiths de test à la base de données
    await Hadith.insertMany([
      {
        metadata: {
          id: 1,
          length: 1,
          arabic: { title: 'كتاب الإيمان', author: 'البخاري', introduction: 'مقدمة كتاب الإيمان' },
          english: { title: 'Book of Faith', author: 'Al-Bukhari', introduction: 'Introduction to the Book of Faith' },
        },
        chapters: [
          { id: 1, bookId: 1, arabic: 'باب الإيمان', english: 'Chapter of Faith' },
        ],
        hadiths: [
          {
            id: 1,
            idInBook: 1,
            chapterId: 1,
            bookId: 1,
            arabic: 'إنما الأعمال بالنيات',
            english: { narrator: 'Umar', text: 'Actions are judged by intentions.' },
          },
        ],
      },
    ]);
  });

  afterAll(async () => {
    // Nettoyer la base de données après les tests
    await Hadith.deleteMany({});
  });

  it('devrait renvoyer des hadiths pertinents pour une question', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ question: 'What are actions judged by?' })
      .expect(200);

    expect(response.body.hadiths).toBeInstanceOf(Array);
    expect(response.body.hadiths.length).toBeGreaterThan(0);
    expect(response.body.hadiths[0].english.text).toContain('Actions are judged by intentions');
  });

  it('devrait renvoyer une erreur si la question est manquante', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('La question est requise.');
  });
});