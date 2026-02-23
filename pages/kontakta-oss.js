import React from 'react';
import Layout from '../layouts/layout';
import { Header } from 'flotiq-components-react';
import { useTranslation } from '../context/TranslationContext';
import { getTranslations } from '../lib/translations';
import { getAllRecipes } from '../lib/recipe';
import { getCategories } from '../lib/category';
import replaceUndefinedWithNull from '../lib/sanitize';
import path from 'path';
import fs from 'fs';

const ContactUsPage = ({ pageContent, allRecipes, categories }) => {
    const { t } = useTranslation();

    const translateContent = (field) => {
        if (typeof field === 'object' && field !== null) {
            return field[pageContent.lang] || field['sv'];
        }
        return field;
    };
    
    const handleDummySubmit = (event) => {
        event.preventDefault();
        alert("Tack för ditt meddelande! Vi återkommer så snart vi kan.");
    };

    return (
        <Layout 
            title={translateContent(pageContent.title)} 
            description={translateContent(pageContent.meta_description)} 
            allRecipesForSearch={allRecipes}
            categories={categories}
            additionalClass={['bg-[#faf9f7]']}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 font-sora leading-tight mb-4 tracking-tight">
                        {translateContent(pageContent.headline)}
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Vi älskar att höra från våra bakvänner!</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* معلومات التواصل */}
                    <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="prose prose-lg text-gray-600 mb-10">
                            {translateContent(pageContent.body).split('\n').map((paragraph, index) => (
                                 <p key={index} className="text-base md:text-lg leading-relaxed mb-4">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                        
                        <div className="bg-secondary/5 p-8 rounded-3xl border border-secondary/10">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] block mb-2">Mejla oss direkt</span>
                            <a href={`mailto:${pageContent.email}`} className="text-xl md:text-2xl font-bold text-gray-900 hover:text-secondary transition-colors break-words">
                                {pageContent.email}
                            </a>
                        </div>
                    </div>

                    {/* نموذج الاتصال */}
                    <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-50">
                        <h2 className="text-2xl font-bold text-gray-900 font-sora mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </span>
                            {t('contact_form_title')}
                        </h2>

                        <form onSubmit={handleDummySubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('your_name')}</label>
                                    <input type="text" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-gray-800" placeholder="Elsa..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('your_email')}</label>
                                    <input type="email" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-gray-800" placeholder="elsa@exempel.se" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('subject')}</label>
                                <input type="text" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-gray-800" placeholder="Gällande recept..." />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('message')}</label>
                                <textarea rows={5} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none text-gray-800 resize-none" placeholder="Hej! Jag undrar..." />
                            </div>
                            <button type="submit" className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-secondary transition-all shadow-lg hover:shadow-secondary/30 transform hover:-translate-y-1">
                                {t('send_message')}
                            </button>
                        </form>
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
    // --- تقليص البيانات ---
    const prunedSearchData = (allRecipesResponse.data || []).map(r => ({
        name: r.name,
        slug: r.slug
    }));

    const categories = await getCategories();

    return {
        props: {
            translations,
            pageContent: { ...allContent.contact, lang: siteConfig.language },
            allRecipes: replaceUndefinedWithNull(prunedSearchData),
            categories: replaceUndefinedWithNull(categories)
        },
    };
}

export default ContactUsPage;