// lib/recipe.js
import { connectToDatabase } from './mongodb';
import config from './config';

async function getPaginatedRecipes(query = {}, page = 1, limit = 10, sort = { datePublished: -1 }) {
    const { db } = await connectToDatabase();
    const recipesCollection = db.collection('recipes');

    const skip = (page - 1) * limit;

    const totalCount = await recipesCollection.countDocuments(query);
    const data = await recipesCollection.find(query)
                                        .sort(sort)
                                        .skip(skip)
                                        .limit(limit)
                                        .toArray();

    return {
        data: data,
        total_count: totalCount,
        count: data.length,
        total_pages: Math.ceil(totalCount / limit),
        current_page: parseInt(page, 10),
    };
}


export async function getRecipe(
    page = 1,
    limit = config.blog.postPerPage || 10,
    filters = undefined, // Note: The old filter logic needs to be re-implemented for MongoDB queries
    direction = 'desc',
    orderBy = 'datePublished',
) {
    const sort = { [orderBy]: direction === 'desc' ? -1 : 1 };
    
    // TODO: Re-implement filter logic to build a MongoDB query object
    // For now, it will fetch all recipes paginated.
    const query = {};

    return getPaginatedRecipes(query, page, limit, sort);
}

export async function getRecipeBySlug(slug) {
  const { db } = await connectToDatabase();
    // ابحث عن وصفة يكون الـ slug الحالي مطابقاً، أو يكون الـ slug المطلوب موجوداً في تاريخ الـ slugs
    const recipe = await db.collection('recipes').findOne({ 
        $or: [
            { slug: slug },
            { slugHistory: slug }
        ] 
    });
    // Mimic the old structure for compatibility
    return recipe 
        ? { data: [recipe], total_count: 1, count: 1, total_pages: 1, current_page: 1 }
        : { data: [], total_count: 0, count: 0, total_pages: 0, current_page: 1 };
}

export async function getAllRecipeSlugs() {
    const { db } = await connectToDatabase();
    const recipes = await db.collection('recipes').find({}, { projection: { slug: 1 } }).toArray();
    return recipes.map(recipe => recipe.slug);
}

export async function getAllRecipes() {
    const { db } = await connectToDatabase();
    const recipes = await db.collection('recipes').find({}).sort({ datePublished: -1 }).toArray();
    
    return {
        data: recipes,
        total_count: recipes.length,
        count: recipes.length,
        total_pages: 1,
        current_page: 1,
    };
}