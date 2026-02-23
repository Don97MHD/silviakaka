import Head from 'next/head';
import Link from 'next/link';
import Layout from '../layouts/layout';
import { getTranslations } from '../lib/translations';
import { getCategories } from '../lib/category';
import { getAllRecipes } from '../lib/recipe';
import replaceUndefinedWithNull from '../lib/sanitize';

const IntegritetspolicyPage = ({ categories, allRecipes }) => {
  const pageTitle = "Integritetspolicy | Silviakaka.se";
  const metaDescription = "Läs om hur Silviakaka.se hanterar och skyddar dina personuppgifter i enlighet med GDPR.";

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
                Integritetspolicy
            </h1>
            <p className="inline-block px-4 py-1.5 bg-gray-200 text-gray-600 rounded-full text-sm font-bold tracking-wider">
                Senast uppdaterad: 28 augusti 2024
            </p>
        </div>

        {/* Content Section */}
        <div className="bg-white p-8 md:p-14 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100">
            <div className="prose prose-lg text-gray-600 max-w-none prose-headings:font-sora prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-secondary hover:prose-a:text-orange-500">
                
                <h2>1. Inledning och Personuppgiftsansvarig</h2>
                <p>
                Välkommen till Silviakaka.se! Vi värnar om din personliga integritet och strävar efter att skydda dina personuppgifter på bästa sätt. Denna integritetspolicy förklarar hur vi samlar in och använder dina personuppgifter i enlighet med Dataskyddsförordningen (GDPR).
                </p>
                <div className="bg-secondary/10 border-l-4 border-secondary p-6 rounded-r-xl my-6">
                    <strong className="text-gray-900 block mb-2">Personuppgiftsansvarig:</strong>
                    <p className="m-0">Elsa Lundström (Silviakaka.se)<br/>E-post: <a href="mailto:elsa@silviakaka.se">elsa@silviakaka.se</a></p>
                </div>

                <h2>2. Vilka uppgifter samlar vi in?</h2>
                <ul>
                    <li><strong>Teknisk information:</strong> IP-adress, webbläsartyp, operativsystem och vilka sidor du besöker.</li>
                    <li><strong>Uppgifter du själv lämnar:</strong> När du kontaktar oss via e-post.</li>
                    <li><strong>Användningsdata via cookies:</strong> Se vår <Link href="/cookiepolicy">Cookiepolicy</Link>.</li>
                </ul>

                <hr className="my-8 border-gray-100" />

                <h2>3. Varför samlar vi in dina uppgifter?</h2>
                <ul>
                    <li>För att driva och säkra webbplatsen (Berättigat intresse).</li>
                    <li>För att analysera och förbättra vår tjänst (Samtycke).</li>
                    <li>För att visa anpassade annonser (Samtycke).</li>
                    <li>För att kommunicera med dig (Berättigat intresse).</li>
                </ul>

                <hr className="my-8 border-gray-100" />

                <h2>4. Vem delar vi dina uppgifter med?</h2>
                <p>
                Vi säljer aldrig dina personuppgifter. Vi kan dock dela teknisk data med:
                </p>
                <ul>
                    <li>Leverantörer av webbhotell.</li>
                    <li>Analysverktyg (t.ex. Google Analytics).</li>
                    <li>Annonsnätverk för att visa anpassade annonser.</li>
                </ul>

                <hr className="my-8 border-gray-100" />

                <h2>5. Dina rättigheter enligt GDPR</h2>
                <p>Du har rätt till tillgång, rättelse, radering, och att återkalla ditt samtycke. Kontakta oss på <a href="mailto:elsa@silviakaka.se">elsa@silviakaka.se</a> om du vill utöva dessa rättigheter.</p>

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

export default IntegritetspolicyPage;