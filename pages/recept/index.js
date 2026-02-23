import React from 'react';
import Head from 'next/head';
import Layout from '../../layouts/layout';
import config from '../../lib/config';
import RecipeCards from '../../sections/RecipeCards';
import CustomPagination from '../../components/CustomPagination';
import { getRecipe, getAllRecipes } from '../../lib/recipe';
import replaceUndefinedWithNull from '../../lib/sanitize';
import { Header, Paragraph } from 'flotiq-components-react';
import { getRecipePageLink } from '../../lib/utils';
import { getTranslations } from '../../lib/translations';
import { useTranslation } from '../../context/TranslationContext';
import { getCategories } from '../../lib/category'; // <-- ADDED

const RecipeIndexPage = ({ recipes, pageContext, allRecipes, categories }) => { // <-- ADDED categories
      const { t } = useTranslation();
    const pageTitle = `Alla Våra Recept | ${config.siteMetadata.title}`;
    const pageDescription = `Bläddra bland alla läckra recept på ${config.siteMetadata.title}. Upptäck nya favoriter!`;
    const canonicalUrl = `${config.siteMetadata.siteUrl}/recept`;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Alla Recept på Silviakaka.se",
        "description": "En komplett lista över alla publicerade recept.",
        "url": canonicalUrl,
        "numberOfItems": pageContext.totalRecipesOnPage,
        "itemListElement": recipes.map((recipe, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                 "@type": "Recipe",
                 "name": recipe.name,
                 "url": `${config.siteMetadata.siteUrl}/recept/${recipe.slug}`,
                 "image": recipe.image && recipe.image[0] ? `${config.siteMetadata.siteUrl}${recipe.image[0].url}` : undefined,
                 "description": recipe.description ? recipe.description.replace(/<[^>]*>?/gm, '').substring(0,100) + '...' : undefined
            }
        }))
    };

    return (
        <Layout 
            title={pageTitle} 
            description={pageDescription} 
            allRecipesForSearch={allRecipes}
            categories={categories} // <-- PASS categories
        >
            <Head>
                <link rel="canonical" href={canonicalUrl} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
                />
                {pageContext.numPages > 1 && (
                    <link rel="next" href={`${config.siteMetadata.siteUrl}/recept/list/2`} /> 
                )}
            </Head>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Header level={1} additionalClasses={['text-4xl md:text-5xl font-bold text-primary mb-10 text-center']}>
                    Alla Våra Recept
                </Header>

                {recipes && recipes.length > 0 ? (
                    <RecipeCards recipes={recipes} />
                ) : (
                    <Paragraph>Inga recept att visa för tillfället.</Paragraph>
                )}

                {pageContext.numPages > 1 && (
                    <CustomPagination
                        currentPage={1}
                        numPages={pageContext.numPages}
                    />
                )}
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    const { translations } = await getTranslations();
    const page = 1;
    const recipesPerPage = config.blog.postPerPage;
    
    const recipesResponse = await getRecipe(page, recipesPerPage, undefined, 'desc', 'datePublished');
    
    // تقليص بيانات الوصفات المعروضة في الصفحة الحالية
    const prunedPageRecipes = (recipesResponse.data || []).map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        image: r.image,
        cookingTime: r.cookingTime || '',
        servings: r.servings || ''
    }));

    const allRecipesResponse = await getAllRecipes();
    const searchData = (allRecipesResponse.data || []).map(r => ({ name: r.name, slug: r.slug }));
    
    const categories = await getCategories();

    return {
        props: {
            recipes: replaceUndefinedWithNull(prunedPageRecipes),
            pageContext: {
                currentPage: page,
                numPages: recipesResponse.total_pages,
                recipesPerPage: recipesPerPage
            },
            allRecipes: replaceUndefinedWithNull(searchData),
            translations,
            categories: replaceUndefinedWithNull(categories)
        },
    };
}

export default RecipeIndexPage;