import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as gtag from '../lib/gtag';
import { TranslationProvider } from '../context/TranslationContext'; 

const MyApp = ({ Component, pageProps }) => {
    const router = useRouter();
    
    useEffect(() => {
        const handleRouteChange = (url) => {
            gtag.pageview(url);
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    const { translations, ...restPageProps } = pageProps;

    return (
        <TranslationProvider translations={translations || {}}>
            <div className="bg-white">
                <Head>
                    <title>Silviakaka</title>
                </Head>
                
                {/* Google Analytics Script */}

                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
                />
                   <script async
src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9653005764752290"
     crossorigin="anonymous"></script>
                <Script
                    id="gtag-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
                    }}
                />
                
                <Component {...restPageProps} />
            </div>
        </TranslationProvider>
    );
}

export default MyApp;
