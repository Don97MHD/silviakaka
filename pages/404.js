import React from 'react';
import Link from 'next/link';
import Layout from '../layouts/layout';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';
import { getCategories } from '../lib/category'; 
import { getTranslations } from '../lib/translations'; // <-- تمت إضافة الاستيراد

const title = 'Sidan hittades inte | 404';

const NotFoundPage = ({ allRecipes, categories }) => { 
    return (
        <Layout 
            title={title} 
            allRecipesForSearch={allRecipes}
            categories={categories} 
            additionalClass={['bg-[#faf9f7]']}
        >
            <main className="flex flex-col min-h-[60vh] justify-center items-center px-4 text-center">
                <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl shadow-gray-100/50 border border-gray-100 max-w-2xl w-full">
                    <h1 className="text-8xl md:text-9xl font-black text-secondary font-sora mb-6">404</h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Hoppsan!</h2>
                    <p className="text-lg text-gray-600 mb-10 font-medium">
                        Det verkar som att någon har ätit upp sidan du letar efter. Den existerar tyvärr inte längre.
                    </p>
                    <Link href="/" className="inline-flex px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-secondary transition-colors shadow-lg">
                        Gå tillbaka till startsidan
                    </Link>
                </div>
            </main>
        </Layout>
    );
};

export async function getStaticProps() {
    const { translations } = await getTranslations(); // <-- جلب الترجمة
    const recipeData = await getAllRecipes();
    const allRecipes = recipeData?.data ? replaceUndefinedWithNull(recipeData.data) : [];
    const categories = await getCategories(); 

    return {
        props: {
            translations, // <-- تمرير الترجمة
            allRecipes,
            categories: replaceUndefinedWithNull(categories) 
        },
    };
}

export default NotFoundPage;