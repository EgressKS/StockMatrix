const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Drop old indexes with null googleId values and recreate collection if needed
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections().toArray();
      const usersCollectionExists = collections.some(col => col.name === 'users');
      
      if (usersCollectionExists) {
        const collection = db.collection('users');
        const indexes = await collection.indexes();
        
        // Drop the old googleId index if it exists
        const googleIdIndex = indexes.find(idx => idx.name === 'googleId_1');
        if (googleIdIndex) {
          console.log('Dropping old googleId index...');
          await collection.dropIndex('googleId_1');
          console.log('Old googleId index dropped successfully');
        }
        
        // Clean up any null googleId documents
        const nullGoogleIdDocs = await collection.countDocuments({ googleId: null });
        if (nullGoogleIdDocs > 0) {
          console.log(`Found ${nullGoogleIdDocs} documents with null googleId, cleaning up...`);
          await collection.updateMany(
            { googleId: null },
            { $unset: { googleId: '' } }
          );
          console.log('Cleaned up null googleId values');
        }
      }
    } catch (indexError) {
      console.log('Index cleanup note:', indexError.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
