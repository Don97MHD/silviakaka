import React from 'react';
import RecipeTemplate from '../../templates/RecipePost';
import { getRecipeBySlug, getAllRecipeSlugs, getAllRecipes } from '../../lib/recipe';
import replaceUndefinedWithNull from '../../lib/sanitize';
import config from '../../lib/config';
import { getTranslations } from '../../lib/translations';
import { getCategories } from '../../lib/category'; // <-- ADDED

const RecipeDetailPage = ({ postData, pageContext, allRecipes, categories }) => { // <-- ADDED categories
    return <RecipeTemplate 
                post={postData} 
                pageContext={pageContext} 
                allRecipes={allRecipes} 
                categories={categories} // <-- PASS categories
            />;
};

export async function getStaticProps({ params }) {
    const requestedSlug = params.slug;
    const recipeBySlugResponse = await getRecipeBySlug(requestedSlug);

    if (!recipeBySlugResponse || !recipeBySlugResponse.data || recipeBySlugResponse.data.length === 0) {
        return { notFound: true };
    }

    const recipeData = replaceUndefinedWithNull(recipeBySlugResponse.data[0]);

    // جلب كل الوصفات
    const allRecipesResponse = await getAllRecipes();
    const allData = allRecipesResponse.data || [];

    // --- الحل السحري لتقليل الحجم ---
    // 1. فلترة "الوصفات المقترحة" - نأخذ فقط ما يلزم للكرت
    const sanitizedOtherRecipes = allData
        .filter(recipe => recipe.slug !== recipeData.slug)
        .slice(0, 6)
        .map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            image: r.image,
            cookingTime: r.cookingTime || '',
            servings: r.servings || ''
            // لاحظ: لم نأخذ المكونات ولا الخطوات ولا الوصف هنا!
        }));

    // 2. فلترة "بيانات البحث" - نأخذ فقط الاسم والـ slug
    const searchData = allData.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug
    }));

    const { translations } = await getTranslations();
    const categories = await getCategories();

    return {
        props: {
            postData: recipeData, // الوصفة الأساسية نرسلها كاملة طبعاً
            pageContext: {
                otherRecipes: replaceUndefinedWithNull(sanitizedOtherRecipes),
            },
            allRecipes: replaceUndefinedWithNull(searchData), // بيانات البحث خفيفة جداً الآن
            translations,
            categories: replaceUndefinedWithNull(categories)
        },
        revalidate: 60,
    };
}


export async function getStaticPaths() {
    const slugs = await getAllRecipeSlugs();
    return {
        paths: slugs.map((slug) => ({
            params: { slug },
        })),
        fallback: 'blocking',
    };
}

export default RecipeDetailPage;