import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../layouts/layout';
import { useTranslation } from '../context/TranslationContext';
import { getTranslations } from '../lib/translations';
import { getAllRecipes } from '../lib/recipe';
import { getCategories } from '../lib/category';
import replaceUndefinedWithNull from '../lib/sanitize';
import path from 'path';
import fs from 'fs';

const OmOssPage = ({ pageContent, allRecipes, categories }) => {
    const { t } = useTranslation();

    const translateContent = (field) => {
        if (typeof field === 'object' && field !== null) {
            return field[pageContent.lang] || field['sv'];
        }
        return field;
    };
    
    return (
        <Layout 
            title={translateContent(pageContent.title)} 
            description={translateContent(pageContent.meta_description)} 
            allRecipesForSearch={allRecipes}
            categories={categories}
            additionalClass={['bg-[#faf9f7] overflow-hidden']}
        >
            {/* أشكال غرافيكية عائمة في الخلفية */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-96 h-96 bg-yellow-100/50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-orange-100/40 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 font-sora leading-tight mb-4 tracking-tight">
                        {translateContent(pageContent.headline)}
                    </h1>
                    <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full"></div>
                </div>

                <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl transform scale-110"></div>
                            <div className="relative p-2 bg-white rounded-full shadow-lg border border-gray-50">
                                <Image
                                    src="/images/elsa-placeholder.jpg"
                                    alt="Elsa Lundström"
                                    width={280}
                                    height={280}
                                    className="rounded-full object-cover shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="prose prose-base md:prose-lg text-gray-600 leading-relaxed font-medium max-w-3xl mx-auto text-center">
                            {translateContent(pageContent.body).split('\n').map((paragraph, index) => (
                                 <p key={index} className="mb-6">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                        
                        <div className="mt-12 flex justify-center opacity-40">
                             <svg width="100" height="20" viewBox="0 0 100 20"><path d="M10 10C30 10 30 15 50 15C70 15 70 10 90 10" stroke="#D4AF37" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export async function getStaticProps() {
    const { translations } = await getTranslations();
    const pageContentPath = path.join(process.cwd(), 'data', 'pageContent.json');
    const allContent = JSON.parse(fs.readFileSync(pageContentPath, 'utf-8'));
    const siteConfigPath = path.join(process.cwd(), 'data', 'siteConfig.json');
    const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));

    const allRecipesResponse = await getAllRecipes();
    // --- تقليص البيانات هنا ---
    const prunedSearchData = (allRecipesResponse.data || []).map(r => ({
        name: r.name,
        slug: r.slug
    }));
    
    const categories = await getCategories();

    return {
        props: {
            translations,
            pageContent: { ...allContent.about, lang: siteConfig.language },
            allRecipes: replaceUndefinedWithNull(prunedSearchData),
            categories: replaceUndefinedWithNull(categories)
        },
    };
}

export default OmOssPage;