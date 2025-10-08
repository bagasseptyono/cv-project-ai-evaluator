const {QdrantClient} = require('@qdrant/js-client-rest');

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_APIKEY,
});

// try {
//     const result = await qdrant.getCollections();
//     console.log('List of collections:', result.collections);
// } catch (err) {
//     console.error('Could not get collections:', err);
// }

module.exports = qdrant