// lib/category.js
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export async function getCategories() {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');
    const categories = await categoriesCollection.find({}).sort({ name: 1 }).toArray(); // Sort by name for display
    return categories;
}

export async function getCategoryBySlug(slug) {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');
    const category = await categoriesCollection.findOne({ slug: slug });
    return category;
}

export async function addCategory(categoryData) {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');
    const result = await categoriesCollection.insertOne({
        ...categoryData,
        dateCreated: new Date(),
    });
    return result;
}

export async function updateCategory(id, categoryData) {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');
    const result = await categoriesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: categoryData }
    );
    return result;
}

export async function deleteCategory(id) {
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection('categories');
    const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });
    return result;
}

export async function getAllCategorySlugs() {
    const { db } = await connectToDatabase();
    const categories = await db.collection('categories').find({}, { projection: { slug: 1 } }).toArray();
    return categories.map(cat => cat.slug);
}