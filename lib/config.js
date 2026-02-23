const config = {
    siteMetadata: {
        title: 'Silviakaka',
        description: 'Silviakaka - Din guide till den perfekta Silviakakan',
        siteUrl: 'https://silviakaka.se', // Viktigt för absoluta URL:er i schema
    },
    blog: {
        postPerPage: 6,
    },
    author: { // För schema.org Receptförfattare
        "@type": "Person",
        "name": "Elsa Lundström",
        "url": "https://silviakaka.se/om-oss" // Länk till Elsas sida (justera om du bytte namn på filen)
    }
};
export default config;