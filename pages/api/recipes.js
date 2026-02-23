// pages/api/recipes.js
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return token === 'fake-secure-token';
};

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { db } = await connectToDatabase();
        const recipesCollection = db.collection('recipes');

        switch (req.method) {
            case 'GET': { // <--- القوس الافتتاحي
                const recipes = await recipesCollection.find({})
                                                      .sort({ datePublished: -1 })
                                                      .toArray();
                res.status(200).json(recipes);
                break;
            } // <--- القوس الختامي

            case 'POST': { // <--- القوس الافتتاحي
                const newRecipe = req.body;
                delete newRecipe._id; 
                const result = await recipesCollection.insertOne(newRecipe);
                res.status(201).json({ message: 'Recipe added successfully!', insertedId: result.insertedId });
                break;
            } // <--- القوس الختامي
            
            case 'PUT': { // <--- القوس الافتتاحي
                const { _id, ...updatedRecipeData } = req.body;
                if (!_id) {
                    return res.status(400).json({ message: 'Recipe _id is required for update.' });
                }
                const result = await recipesCollection.updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: updatedRecipeData }
                );
                
                if (result.matchedCount === 0) {
                     return res.status(404).json({ message: 'Recipe not found.' });
                }
                res.status(200).json({ message: 'Recipe updated successfully!' });
                break;
            } // <--- القوس الختامي
            
            case 'DELETE': { // <--- القوس الافتتاحي
                const { id } = req.query;
                if (!id) {
                     return res.status(400).json({ message: 'Recipe ID is required.' });
                }
                const result = await recipesCollection.deleteOne({ _id: new ObjectId(id) });
                
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Recipe not found.' });
                }
                res.status(200).json({ message: 'Recipe deleted successfully!' });
                break;
            } // <--- القوس الختامي

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        // هذا سيمسك أي خطأ، بما في ذلك أخطاء الاتصال بقاعدة البيانات
        console.error("API Error in /api/recipes:", error);
        res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
}