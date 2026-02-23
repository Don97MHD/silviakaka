import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import config from '../lib/config';

// SVG paths for icons
const facebookPath = "M8.30466 24.1211V13.5346H11.8761L12.407 9.38964H8.30466V6.74947C8.30466 5.55339 8.63791 4.73447 10.3545 4.73447H12.5297V1.03902C11.4714 0.925596 10.4076 0.870832 9.34316 0.874974C6.18633 0.874974 4.01891 2.80214 4.01891 6.34002V9.38189H0.470703V13.5268H4.02666V24.1211H8.30466Z";
const instagramPath = 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z';

const Footer = ({ categories = [] }) => {
    // جلب أول 4 تصنيفات بشكل ديناميكي
    const featuredCategories = categories.slice(0, 4);

    return (
        <footer className="bg-[#111827] text-white pt-16 relative overflow-hidden">
            {/* Newsletter Section (Visual enhancement) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
                <div className="bg-secondary rounded-[2rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-4xl font-black font-sora text-gray-900 mb-4">
                            Missa aldrig ett recept!
                        </h3>
                        <p className="text-gray-800 font-medium mb-8 max-w-xl mx-auto">
                            Prenumerera på vårt nyhetsbrev och få de senaste och smaskigaste recepten direkt i din inkorg.
                        </p>
                        <form className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto gap-3" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Din e-postadress" 
                                className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50 border-0 shadow-inner"
                                required
                            />
                            <button type="submit" className="px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg whitespace-nowrap">
                                Prenumerera
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
                    
                    {/* Brand / About */}
                    <div className="md:col-span-4 lg:col-span-5 pr-0 lg:pr-8 text-center md:text-left">
                        <Link href="/" className="inline-block mb-6 bg-white p-3 rounded-2xl shadow-lg">
                            <Image
                                src="/assets/recipe-logo.png"
                                alt={`${config.siteMetadata.title} Logotyp`}
                                width={150}
                                height={60}
                            />
                        </Link>
                        <p className="text-gray-400 leading-relaxed text-[15px]">
                            Din guide till svenska fikaklassiker. Upptäck, baka och njut av de bästa recepten, från den ljuvliga Silviakakan till oemotståndlig Kladdkaka. Skapad med kärlek till fika.
                        </p>
                        <div className="flex items-center justify-center md:justify-start space-x-4 mt-8">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 13 25"><path fillRule="evenodd" d={facebookPath} clipRule="evenodd" /></svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#E1306C] hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d={instagramPath} clipRule="evenodd" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Snabblänkar */}
                    <div className="md:col-span-4 lg:col-span-3 text-center md:text-left">
                        <h4 className="text-white font-sora font-bold text-lg tracking-wide mb-6">Snabblänkar</h4>
                        <ul className="space-y-4">
                            <li><Link href="/recept" className="text-gray-400 hover:text-secondary hover:translate-x-1 inline-block transition-all">Alla Recept</Link></li>
                            <li><Link href="/om-oss" className="text-gray-400 hover:text-secondary hover:translate-x-1 inline-block transition-all">Om Oss (Elsa)</Link></li>
                            <li><Link href="/kontakta-oss" className="text-gray-400 hover:text-secondary hover:translate-x-1 inline-block transition-all">Kontakta Oss</Link></li>
                        </ul>
                    </div>

                    {/* Kategorier */}
                    <div className="md:col-span-4 lg:col-span-4 text-center md:text-left">
                        <h4 className="text-white font-sora font-bold text-lg tracking-wide mb-6">Populära Kategorier</h4>
                        <ul className="space-y-4">
                            {featuredCategories.map(cat => (
                                <li key={cat.slug}>
                                    <Link href={`/${cat.slug}`} className="text-gray-400 hover:text-secondary hover:translate-x-1 inline-block transition-all capitalize">
                                        {cat.name.sv}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Sub-footer for Copyright */}
            <div className="border-t border-white/10 mt-4 relative z-10 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                        &copy; {new Date().getFullYear()} {config.siteMetadata.title}. Alla rättigheter förbehållna.
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                        <Link href="/integritetspolicy" className="text-gray-500 hover:text-white transition-colors">
                            Integritetspolicy
                        </Link>
                        <Link href="/cookiepolicy" className="text-gray-500 hover:text-white transition-colors">
                            Cookiepolicy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;