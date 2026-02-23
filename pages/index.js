import React, { Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../layouts/layout';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { useTranslation } from '../context/TranslationContext';
import { getCategories } from '../lib/category';
import config from '../lib/config';
import CustomRecipeCard from '../components/RecipeCard';

const HomePage = ({ featuredRecipe, latestRecipes, recipesByCategory, allRecipes, categories }) => {
    const { t } = useTranslation();

    const pageTitle = `${config.siteMetadata.title} - Recept på Silviakaka, Kladdkaka & Mjuka Kakor`;
    const pageDescription = "Välkommen till Silviakaka.se – Din ultimata guide till svenska bakverk. Här hittar du de bästa recepten på Silviakaka, kladdkaka och andra favoriter.";

    if (!featuredRecipe) {
        return <Layout title={pageTitle} description={pageDescription} categories={categories}><div className="text-center py-20">Laddar...</div></Layout>;
    }
    
    return (
       <Layout 
            title={pageTitle}
            description={pageDescription}
            allRecipesForSearch={allRecipes} 
            categories={categories}
            additionalClass={['bg-[#faf9f7]']} // خلفية فانيلا هادئة
        >
            {/* Section 1: Hero Section (Magazine Style) */}
            <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-16">
                <div className="relative w-full h-[60vh] md:h-[75vh] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white">
                    <Image
                        src={featuredRecipe.image?.[0]?.url || '/images/placeholder.jpg'}
                        alt={featuredRecipe.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-1000 hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* بطاقة النص العائمة */}
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 flex flex-col justify-end">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-10 rounded-[2rem] max-w-3xl transform transition-all hover:-translate-y-2">
                            <span className="inline-block px-3 py-1 bg-secondary text-white text-xs font-bold uppercase tracking-widest rounded-lg mb-4 shadow-sm">
                                Veckans Favorit
                            </span>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-sora text-white mb-4 leading-tight drop-shadow-md">
                                {featuredRecipe.name}
                            </h1>
                            <p className="text-white/90 text-sm md:text-lg mb-8 line-clamp-2 md:line-clamp-3 font-medium">
                                {featuredRecipe.description.replace(/<[^>]*>?/gm, '')}
                            </p>
                            <Link href={`/recept/${featuredRecipe.slug}`} className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-secondary hover:text-white transition-colors duration-300 shadow-xl">
                                {t('read_the_recipe')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

             {/* Section 2: Latest Recipes */}
             <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-200 pb-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-sora">
                            {t('latest_recipes')}
                        </h2>
                        <p className="text-gray-500 mt-2 font-medium">{t('fresh_from_oven')}</p>
                    </div>
                    <Link href="/recept" className="hidden md:inline-flex text-secondary font-bold hover:text-orange-500 transition-colors uppercase tracking-wider text-sm mt-4 md:mt-0 items-center">
                        Visa alla recept 
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                </div>
                
                <div className="flex flex-wrap -mx-3">
                    {latestRecipes.map((recipe) => (
                        <CustomRecipeCard 
                            key={recipe.id} 
                            slug={recipe.slug}
                            name={recipe.name}
                            image={recipe.image?.[0]?.url || '/images/placeholder.jpg'}
                            cookingTime={recipe.cookingTime || ''}
                            servings={recipe.servings || ''}
                        />
                    ))}
                </div>
                
                <div className="mt-8 text-center md:hidden">
                    <Link href="/recept" className="inline-flex px-6 py-3 bg-white border border-gray-200 text-gray-800 font-bold rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                        Visa alla recept
                    </Link>
                </div>
            </section>

            {/* Section 3: Dynamic Category Sections with Injected Blocks */}
            {recipesByCategory.map(({ name, description, slug, recipes }, idx) => (
                <Fragment key={slug}>
                    
                    {/* طباعة قسم التصنيف */}
                    <section className={`py-16 md:py-24 ${idx % 2 !== 0 ? 'bg-white border-y border-gray-100' : ''}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16 max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-5xl font-black text-gray-900 font-sora mb-4 relative inline-block">
                                    {name.sv}
                                    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-secondary rounded-full"></span>
                                </h2>
                                <p className="text-base md:text-lg text-gray-500 font-medium mt-6">
                                    {description.sv.split('\n')[0]}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap -mx-3 justify-center">
                                {recipes.map((recipe) => (
                                    <CustomRecipeCard 
                                        key={recipe.id} 
                                        slug={recipe.slug}
                                        name={recipe.name}
                                        image={recipe.image?.[0]?.url || '/images/placeholder.jpg'}
                                        cookingTime={recipe.cookingTime || ''}
                                        servings={recipe.servings || ''}
                                    />
                                ))}
                            </div>
                            
                            <div className="text-center mt-12">
                                <Link href={`/${slug}`} className="inline-flex px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-secondary transition-all shadow-lg shadow-gray-300 hover:shadow-secondary/30 hover:-translate-y-1">
                                    Upptäck mer {name.sv}
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* --- الحقن الذكي: بعد التصنيف الثاني نعرض صندوق الشيف --- */}
                    {idx === 1 && (
                        <section className="py-20 md:py-28 bg-[#fff9f0] border-y border-[#fcexc2] relative overflow-hidden">
                            {/* زخرفة خلفية */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/40 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                                <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-orange-100/50 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 border border-orange-50">
                                    <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative rounded-full overflow-hidden border-8 border-[#fff9f0] shadow-inner">
                                        <Image src="/images/elsa-placeholder.jpg" alt="Elsa" layout="fill" objectFit="cover" />
                                    </div>
                                    <div className="flex-1 text-center lg:text-left">
                                        <h3 className="text-sm font-black text-secondary uppercase tracking-widest mb-3">Möt Bagaren</h3>
                                        <h2 className="text-3xl md:text-5xl font-black font-sora text-gray-900 mb-6">Hej, jag är Elsa!</h2>
                                        <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium">
                                            Välkommen till min värld av smör, socker och oändlig kärlek till fika. Jag skapade Silviakaka.se för att dela med mig av mormors klassiska recept och mina egna moderna twistar. Bakning ska vara roligt, mysigt och framför allt – gott!
                                        </p>
                                        <Link href="/om-oss" className="inline-flex items-center text-gray-900 font-bold hover:text-secondary transition-colors group">
                                            Läs hela min historia
                                            <span className="ml-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                                                &rarr;
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* --- الحقن الذكي: بعد التصنيف الرابع نعرض صندوق التواصل والمجتمع --- */}
                    {idx === 3 && (
                        <section className="py-24 bg-gray-900 text-white text-center px-4 relative overflow-hidden">
                            {/* زخرفة خلفية داكنة */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="relative z-10 max-w-3xl mx-auto">
                                <svg className="w-12 h-12 mx-auto text-secondary mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <h2 className="text-3xl md:text-5xl font-black font-sora mb-6">Har du bakat något gott?</h2>
                                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                                    Vi älskar att se dina kreationer! Dela dina bilder med oss på sociala medier eller skicka ett mejl om du har frågor om ett recept.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link href="/kontakta-oss" className="px-8 py-4 bg-secondary text-gray-900 font-bold rounded-full hover:bg-white transition-colors shadow-lg shadow-secondary/20">
                                        Kontakta Oss
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}

                </Fragment>
            ))}

        </Layout>
    );
};

export async function getStaticProps() {
    const { getTranslations } = await import('../lib/translations');
    const { translations } = await getTranslations();
    
    try {
        const allRecipesResponse = await getAllRecipes();
        const allData = allRecipesResponse.data || [];
        const categories = await getCategories();

        // فلترة الوصفة المميزة (تحتاج الوصف فقط للـ Hero)
        const featuredRaw = allData[0];
        const featuredRecipe = featuredRaw ? {
            id: featuredRaw.id,
            name: featuredRaw.name,
            slug: featuredRaw.slug,
            image: featuredRaw.image,
            description: featuredRaw.description
        } : null;

        // فلترة بيانات البحث
        const searchData = allData.map(r => ({ name: r.name, slug: r.slug, id: r.id }));

        // تنظيم التصنيفات مع وصفات خفيفة جداً
        const recipesByCategory = categories.map(cat => {
            const recipes = allData
                .filter(r => r.recipeCategory && r.recipeCategory.toLowerCase().includes(cat.name.sv.toLowerCase()))
                .slice(0, 3)
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    slug: r.slug,
                    image: r.image,
                    cookingTime: r.cookingTime || '',
                    servings: r.servings || ''
                }));
            return { ...cat, recipes };
        }).filter(cat => cat.recipes.length > 0);

        return {
            props: {
                featuredRecipe: replaceUndefinedWithNull(featuredRecipe),
                latestRecipes: recipesByCategory[0]?.recipes || [], // نستخدم النسخة المخففة
                recipesByCategory: replaceUndefinedWithNull(recipesByCategory),
                allRecipes: replaceUndefinedWithNull(searchData),
                translations,
                categories: replaceUndefinedWithNull(categories)
            },
        };
    } catch(error) {
         return { props: { featuredRecipe: null, latestRecipes: [], recipesByCategory: [], allRecipes: [], translations, categories: [] } };
    }
}

export default HomePage;