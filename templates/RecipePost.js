import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link'; // <-- ضروري للبريدكامب
import Layout from '../layouts/layout';
import RecipeSteps from '../components/recipe/RecipeSteps';
import FlotiqImage from '../lib/FlotiqImage';
import ElsaBio from '../components/recipe/ElsaBio';
import RecipeCards from '../sections/RecipeCards';
import { useTranslation } from '../context/TranslationContext';
import config from '../lib/config';
import RecipeInfo from '../components/recipe/RecipeInfo';
import StarRating from '../components/StarRating';
import { ClockIcon, FireIcon, ChevronRightIcon, HomeIcon } from '@heroicons/react/outline'; // استيراد أيقونات البريدكامب

const RecipeTemplate = ({ post, pageContext, allRecipes, categories }) => {
    const { t } = useTranslation();

    if (!post) {
        return <Layout categories={categories}><div className="text-center py-20">Laddar recept...</div></Layout>;
    }

    const recipe = post;
    const {otherRecipes} = pageContext;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : `${config.siteMetadata.siteUrl}/recept/${recipe.slug}`;

    // استخراج أول تصنيف للوصفة (إذا وجد) لاستخدامه في البريدكامب
    const firstCategory = recipe.recipeCategory ? recipe.recipeCategory.split(',')[0].trim() : null;

    // Schema code...
    const schemaAuthor = config.author || { "@type": "Organization", "name": "Silviakaka" };
    const recipeSchema = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.name,
        "author": schemaAuthor,
        "description": recipe.description.replace(/<[^>]*>?/gm, ''),
        "image": recipe.image?.map(img => `${config.siteMetadata.siteUrl}${img.url}`),
        "datePublished": recipe.datePublished,
        "recipeCuisine": recipe.recipeCuisine,
        "prepTime": recipe.prepTime,
        "cookTime": recipe.cookingTime,
        "totalTime": recipe.totalTime,
        "keywords": recipe.keywords,
        "recipeYield": recipe.servings ? recipe.servings.toString() : "1 kaka",
        "recipeCategory": recipe.recipeCategory,
        "nutrition": recipe.nutrition,
        "aggregateRating": recipe.aggregateRating ? {
            "@type": "AggregateRating",
            "ratingValue": recipe.aggregateRating.ratingValue,
            "ratingCount": recipe.aggregateRating.ratingCount
        } : undefined,
        "recipeIngredient": recipe.ingredients?.map(i => `${i.amount || ''} ${i.unit || ''} ${i.product}`.trim()),
        "recipeInstructions": recipe.steps?.map((step, index) => ({
            "@type": "HowToStep",
            "name": `Steg ${index + 1}`,
            "text": step.step,
            "url": `${config.siteMetadata.siteUrl}/recept/${recipe.slug}#step${index + 1}`,
            "image": step.image && step.image.length > 0
                ? `${config.siteMetadata.siteUrl}${step.image[0].url}`
                : undefined
        })).filter(step => step.text),
    };
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": t('home'),
                "item": config.siteMetadata.siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": t('recipes'),
                "item": `${config.siteMetadata.siteUrl}/recept`
            },
            ...(recipe.recipeCategory ? [{
                "@type": "ListItem",
                "position": 3,
                "name": recipe.recipeCategory.split(',')[0].trim(),
                "item": `${config.siteMetadata.siteUrl}/recept` 
            }] : []),
            {
                "@type": "ListItem",
                "position": recipe.recipeCategory ? 4 : 3,
                "name": recipe.name,
                "item": currentUrl
            }
        ]
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentUrl);
        alert('Länken har kopierats!'); 
    };

    return (
        <Layout
            allRecipesForSearch={allRecipes} 
            categories={categories}
            additionalClass={['bg-[#faf9f7] overflow-hidden']}
            title={recipe.name}
            description={recipe.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'}
        >
            <Head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            </Head>

            {/* أشكال غرافيكية عائمة */}
            <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

            {/* مسار التنقل الخرافي (Breadcrumbs) بدلاً من زر الرجوع */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
                <nav className="flex text-sm text-gray-500 font-medium" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/" className="inline-flex items-center hover:text-secondary transition-colors">
                                <HomeIcon className="w-4 h-4 mr-1 mb-0.5" />
                                {t('home')}
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                                <Link href="/recept" className="hover:text-secondary transition-colors">
                                    {t('recipes')}
                                </Link>
                            </div>
                        </li>
                        {firstCategory && (
                            <li className="hidden sm:block">
                                <div className="flex items-center">
                                    <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                                    {/* توجيه لصفحة البحث بالقسم أو التصنيف إذا وجد */}
                                    <span className="text-gray-500 hover:text-secondary transition-colors cursor-default">
                                        {firstCategory}
                                    </span>
                                </div>
                            </li>
                        )}
                        <li aria-current="page">
                            <div className="flex items-center">
                                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                                <span className="text-gray-800 font-semibold truncate max-w-[150px] sm:max-w-xs">{recipe.name}</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* 1. الترويسة */}
                <div className="text-center max-w-3xl mx-auto mb-8 mt-6">
                    {recipe.aggregateRating && (
                        <div className="flex items-center justify-center gap-1 mb-4">
                            <StarRating rating={recipe.aggregateRating.ratingValue} starSize="h-4 w-4" color="text-yellow-400" />
                            <span className="text-xs font-medium text-gray-500 ml-1">({recipe.aggregateRating.ratingCount} omdömen)</span>
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 font-sora leading-tight mb-6 tracking-tight">
                        {recipe.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {recipe.prepTime && (
                            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-gray-600 rounded-full text-xs font-bold border border-gray-200 shadow-sm">
                                <ClockIcon className="h-4 w-4 text-blue-400" />
                                <span>{recipe.prepTime.replace('PT','').replace('M', ` ${t('minutes_short')}`)}</span>
                            </div>
                        )}
                        {recipe.cookingTime && (
                            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-gray-600 rounded-full text-xs font-bold border border-gray-200 shadow-sm">
                                <FireIcon className="h-4 w-4 text-orange-400" />
                                <span>{recipe.cookingTime.replace('PT','').replace('M', ` ${t('minutes_short')}`)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. الصورة الرئيسية */}
                <div className="w-full relative aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-white">
                    <Image
                        src={FlotiqImage.getSrc(recipe.image?.[0], 1920, 1080)}
                        alt={recipe.name}
                        layout="fill"
                        objectFit="cover"
                        className="hover:scale-105 transition-transform duration-1000 ease-out"
                        priority
                    />
                </div>

                {/* فاصل مزخرف رائع بعد الصورة */}
                <div className="flex justify-center items-center my-10 opacity-40">
                    <svg width="250" height="24" viewBox="0 0 250 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12H105M145 12H240" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M125 2L135 12L125 22L115 12L125 2Z" fill="#D4AF37"/>
                        <circle cx="125" cy="12" r="3" fill="#ffffff"/>
                    </svg>
                </div>

                {/* 3. شبكة المحتوى (المكونات يمين، والخطوات يسار) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
                    
                    {/* المكونات (Sticky) */}
                    <div className="lg:col-span-5 xl:col-span-4 relative">
                        <div className="sticky top-24 z-10">
                            <RecipeInfo recipe={recipe} />
                        </div>
                    </div>

                    {/* الخطوات + صندوق التقييم */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                            <RecipeSteps 
                                steps={recipe.steps || []} 
                                additionalClass={['bg-transparent relative z-10 w-full max-w-full']} 
                                headerText={t('instructions')} 
                            />
                        </div>

                        {/* صندوق التقييم والمشاركة */}
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Receptbetyg</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-sora font-extrabold text-gray-800 leading-none">
                                            {recipe.aggregateRating?.ratingValue || '5.0'}
                                        </span>
                                        <StarRating rating={recipe.aggregateRating?.ratingValue || 5} starSize="h-5 w-5" color="text-secondary" />
                                    </div>
                                </div>
                                <div className="h-px w-full sm:h-12 sm:w-px bg-gray-100"></div>
                                <div className="flex flex-col items-center sm:items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dela med vänner</span>
                                    <div className="flex items-center gap-2">
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-50 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-full transition-all shadow-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                                        <a href={`https://pinterest.com/pin/create/button/?url=${currentUrl}&media=${config.siteMetadata.siteUrl}${recipe.image?.[0]?.url}&description=${recipe.name}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-gray-50 text-[#E60023] hover:bg-[#E60023] hover:text-white rounded-full transition-all shadow-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.979 7.436 6.953 0 4.156-2.618 7.502-6.262 7.502-1.222 0-2.373-.635-2.766-1.387l-.754 2.872c-.272 1.043-1.012 2.348-1.508 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.366 18.602 0 12.017 0z"/></svg></a>
                                        <button onClick={copyToClipboard} title="Kopiera länk" className="flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. الوصف (نقل للأسفل) */}
                <div className="bg-white p-8 md:p-14 rounded-[2rem] shadow-sm border border-gray-100 max-w-5xl mx-auto">
                    <h2 className="uppercase tracking-widest text-sm font-extrabold text-gray-400 mb-8 flex items-center gap-4">
                        {t('description')}
                        <span className="h-px flex-grow bg-gray-200"></span>
                    </h2>
                    <div className="prose prose-base md:prose-lg text-gray-600 leading-relaxed font-medium max-w-none prose-a:text-secondary prose-a:font-bold hover:prose-a:text-orange-500 prose-a:transition-colors">
                        <div dangerouslySetInnerHTML={{ __html: recipe.description }} />
                    </div>
                </div>
            </main>

            <div className="mt-8 bg-white/40 py-16 border-t border-white/60">
                <ElsaBio t={t}/>
            </div>

            {otherRecipes && otherRecipes.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                     <RecipeCards recipes={otherRecipes} headerText={t('more_recipes_to_explore')} />
                </div>
            )}
        </Layout>
    );
};

export default RecipeTemplate;