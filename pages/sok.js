import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../layouts/layout';
import { Header, Paragraph } from 'flotiq-components-react';
import RecipeCards from '../sections/RecipeCards';
import { getAllRecipes } from '../lib/recipe';
import config from '../lib/config';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getCategories } from '../lib/category'; // <-- ADDED

const SearchPage = ({ allRecipes, categories }) => { // <-- ADDED categories
    const router = useRouter();
    const { q: searchTerm } = router.query;
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (searchTerm && allRecipes) {
            const lowerCaseSearchTerm = (searchTerm).toLowerCase();
            const filtered = allRecipes.filter(recipe =>
                (recipe.name && recipe.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (recipe.description && recipe.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (recipe.keywords && recipe.keywords.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (recipe.ingredients && recipe.ingredients.some(ing => ing.product && ing.product.toLowerCase().includes(lowerCaseSearchTerm)))
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, allRecipes]);

    const pageTitle = searchTerm 
        ? `Sökresultat för "${searchTerm}" | ${config.siteMetadata.title}` 
        : `Sök Recept | ${config.siteMetadata.title}`;
    const pageDescription = searchTerm 
        ? `Visar recept som matchar din sökning på "${searchTerm}".`
        : `Sök bland hundratals läckra recept på ${config.siteMetadata.title}.`;

    return (
        <Layout 
            title={pageTitle} 
            description={pageDescription}  
            allRecipesForSearch={allRecipes}
            categories={categories} // <-- PASS categories
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Header level={1} additionalClasses={['text-3xl md:text-4xl font-semibold mb-8']}>
                    {searchTerm ? `Sökresultat för: "${searchTerm}"` : 'Sök Recept'}
                </Header>

                {searchTerm && searchResults.length > 0 && (
                    <RecipeCards recipes={searchResults} headerText={`${searchResults.length} recept hittades`} />
                )}
                
                {searchTerm && searchResults.length === 0 && (
                    <Paragraph>
                        Inga recept matchade din sökning på "{searchTerm}". Prova gärna med andra sökord.
                    </Paragraph>
                )}

                {!searchTerm && (
                    <Paragraph>
                        Använd sökfältet i headern för att hitta specifika recept.
                    </Paragraph>
                )}
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    const recipeData = await getAllRecipes();
    const allData = recipeData?.data || [];

    // نرسل فقط البيانات الضرورية لعملية البحث (الاسم، الوصف، الكلمات المفتاحية) 
    // ونحذف "الخطوات" و "المكونات التفصيلية" لأنها ضخمة جداً
    const lightSearchData = allData.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        image: r.image, // نحتاجه لعرض النتائج
        description: r.description, // نحتاجه للبحث النصي
        keywords: r.keywords,
        cookingTime: r.cookingTime,
        servings: r.servings
        // حذفنا المكونات (ingredients) والخطوات (steps)
    }));

    const categories = await getCategories();
    return {
        props: {
            allRecipes: replaceUndefinedWithNull(lightSearchData),
            categories: replaceUndefinedWithNull(categories)
        },
    };
}

export default SearchPage;