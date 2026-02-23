
import Head from 'next/head';
import Layout from '../../../layouts/layout';
import config from '../../../lib/config';
import RecipeCards from '../../../sections/RecipeCards';
import CustomPagination from '../../../components/CustomPagination';
import { getRecipe, getAllRecipes } from '../../../lib/recipe';
import replaceUndefinedWithNull from '../../../lib/sanitize';
import { Header, Paragraph } from 'flotiq-components-react';
import { getRecipePageLink } from '../../../lib/utils';
import { getTranslations } from '../../../lib/translations';
import { useTranslation } from '../../../context/TranslationContext';
import { getCategories } from '../../../lib/category'; // <-- ADDED

const RecipeListPage = ({ recipes, pageContext, allRecipes, categories }) => { // <-- ADDED categories
    const { t } = useTranslation();
    const pageTitle = `Alla Våra Recept - Sida ${pageContext.currentPage} | ${config.siteMetadata.title}`;
    const pageDescription = `Bläddra bland alla läckra recept på ${config.siteMetadata.title}. Sida ${pageContext.currentPage} av ${pageContext.numPages}.`;
    const canonicalUrl = `${config.siteMetadata.siteUrl}/recept/list/${pageContext.currentPage}`;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Recept - Sida ${pageContext.currentPage}`,
        "description": `Lista över recept, sida ${pageContext.currentPage}`,
        "url": canonicalUrl,
        "numberOfItems": pageContext.totalRecipesOnPage,
        "itemListElement": recipes.map((recipe, index) => ({
            "@type": "ListItem",
            "position": (pageContext.currentPage - 1) * pageContext.recipesPerPage + index + 1,
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
                {pageContext.currentPage > 1 && (
                    <link rel="prev" href={getRecipePageLink(pageContext.currentPage - 1)} />
                )}
                
                {pageContext.currentPage < pageContext.numPages && (
                    <link rel="next" href={getRecipePageLink(pageContext.currentPage + 1)} />
                )}
            </Head>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Header level={1} additionalClasses={['text-4xl md:text-5xl font-bold text-primary mb-10 text-center']}>
                    Alla Våra Recept (Sida {pageContext.currentPage})
                </Header>

                {recipes && recipes.length > 0 ? (
                    <RecipeCards recipes={recipes} />
                ) : (
                    <Paragraph>Inga fler recept att visa.</Paragraph>
                )}

                {pageContext.numPages > 1 && (
                    <CustomPagination
                        currentPage={pageContext.currentPage}
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
export async function getStaticPaths() {
    const recipesResponse = await getAllRecipes();
    const numPages = Math.ceil(recipesResponse.total_count / config.blog.postPerPage);
    const paths = [];

    for (let i = 2; i <= numPages; i += 1) {
        paths.push({
            params: { pageNumber: i.toString() },
        });
    }
    return { paths, fallback: false };
}

export default RecipeListPage;