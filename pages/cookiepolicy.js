import Head from 'next/head';
import Link from 'next/link';
import Layout from '../layouts/layout';
import { getTranslations } from '../lib/translations';
import { getCategories } from '../lib/category';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';

const CookiePolicyPage = ({ categories, allRecipes }) => {
  const pageTitle = "Cookiepolicy | Silviakaka.se";
  const metaDescription = "Läs om hur Silviakaka.se använder cookies för att förbättra din upplevelse, analysera trafik och visa relevanta annonser.";

  return (
    <Layout 
        title={pageTitle} 
        description={metaDescription} 
        additionalClass={['bg-[#faf9f7]']}
        categories={categories}
        allRecipesForSearch={allRecipes}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Header Section */}
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black font-sora text-gray-900 mb-6">
                Cookiepolicy
            </h1>
            <p className="inline-block px-4 py-1.5 bg-gray-200 text-gray-600 rounded-full text-sm font-bold tracking-wider">
                Senast uppdaterad: 14 oktober 2025
            </p>
        </div>

        {/* Content Section */}
        <div className="bg-white p-8 md:p-14 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
            <div className="prose prose-lg text-gray-600 max-w-none prose-headings:font-sora prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-secondary hover:prose-a:text-orange-500">
                
                <h2>1. Vad är cookies?</h2>
                <p>
                En cookie (eller kaka) är en liten textfil som lagras på din dator, mobil eller surfplatta när du besöker en webbplats. Den hjälper webbplatsen att komma ihåg information om ditt besök, såsom dina inställningar, vilket kan göra ditt nästa besök enklare och webbplatsen mer användbar för dig.
                </p>
                <p>
                Enligt lagen om elektronisk kommunikation (LEK) ska alla som besöker en webbplats med cookies få tillgång till information om att webbplatsen innehåller cookies och ändamålet med användningen av cookies. Besökaren ska också lämna sitt samtycke till att cookies används.
                </p>

                <hr className="my-8 border-gray-100" />

                <h2>2. Hur vi använder cookies</h2>
                <p>På Silviakaka.se använder vi cookies för flera ändamål:</p>
                <ul className="space-y-4">
                    <li className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <strong className="text-gray-900 block mb-1">Nödvändiga cookies:</strong> 
                        Dessa är avgörande för att webbplatsen ska fungera korrekt. De möjliggör grundläggande funktioner som sidnavigering. Webbplatsen kan inte fungera optimalt utan dessa cookies, och de kräver inte ditt samtycke.
                    </li>
                    <li className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <strong className="text-gray-900 block mb-1">Funktionella cookies:</strong> 
                        Dessa cookies används för att komma ihåg dina val (t.ex. om du har godkänt cookies) för att förbättra din användarupplevelse.
                    </li>
                    <li className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <strong className="text-gray-900 block mb-1">Analytiska cookies (Statistik):</strong> 
                        Dessa hjälper oss att förstå hur våra besökare interagerar med webbplatsen genom att samla in och rapportera information anonymt. Vi använder Google Analytics.
                    </li>
                    <li className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <strong className="text-gray-900 block mb-1">Marknadsföringscookies (Annonsering):</strong> 
                        Dessa cookies används för att visa annonser som är relevanta och engagerande för dig som användare.
                    </li>
                </ul>

                <hr className="my-8 border-gray-100" />

                <h2>3. Tredjepartscookies</h2>
                <p>Vissa cookies på vår webbplats placeras av tredjepartsleverantörer. Detta gäller främst för analys och marknadsföring.</p>
                <ul>
                    <li><strong>Google Analytics:</strong> Används för att samla in anonym statistik om webbplatsanvändning.</li>
                    <li><strong>Annonspartners:</strong> Vårt annonsskript kan anropa flera olika annonsnätverk som i sin tur kan placera cookies för att anpassa annonser.</li>
                </ul>

                <hr className="my-8 border-gray-100" />

                <h2>4. Mer information</h2>
                <p>
                Om du vill veta mer om hur vi hanterar personuppgifter i allmänhet, vänligen läs vår <Link href="/integritetspolicy">Integritetspolicy</Link>.
                </p>
                <p>
                För ytterligare frågor om vår användning av cookies, är du välkommen att kontakta oss på: <a href="mailto:elsa@silviakaka.se">elsa@silviakaka.se</a>.
                </p>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
    const { translations } = await getTranslations();
    const categories = await getCategories();
    const allRecipesResponse = await getAllRecipes();
    const allRecipes = allRecipesResponse ? replaceUndefinedWithNull(allRecipesResponse.data) : [];

    return {
        props: {
            translations,
            categories: replaceUndefinedWithNull(categories),
            allRecipes,
        },
    };
}

export default CookiePolicyPage;