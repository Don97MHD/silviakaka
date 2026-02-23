import React, { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { MenuIcon, XIcon, ChevronDownIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import config from '../lib/config';
import { useRouter } from 'next/router';
import SearchWidget from './SearchWidget';
import { useTranslation } from '../context/TranslationContext';

const PageHeader = ({ allRecipesForSearch = [], categories = [] }) => {
    const { t } = useTranslation();
    const router = useRouter();
    
    // تأثير الظل عند النزول بالصفحة
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const staticLinks = [
        { name: t('home'), href: '/', type: 'link' },
    ];

    const recipeDropdown = {
        name: t('recipes'),
        type: 'dropdown',
        href: '/recept',
        subLinks: [
            { name: t('all_recipes'), href: '/recept' },
            ...categories.map(cat => ({ name: cat.name.sv, href: `/${cat.slug}` })),
        ],
    };

    const navigationLinks = [
        ...staticLinks,
        recipeDropdown,
        { name: t('about_us'), href: '/om-oss', type: 'link' },
        { name: t('contact_us'), href: '/kontakta-oss', type: 'link' },
    ];

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ');
    }

    return (
        <Disclosure as="nav" className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-50'}`}>
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20 md:h-24">
                            {/* Logo */}
                            <div className="flex-shrink-0 mr-4 md:mr-8">
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src="/assets/recipe-logo.png"
                                        alt={`${config.siteMetadata.title} Logotyp`}
                                        width={160}
                                        height={60}
                                        priority
                                        className="transition-transform hover:scale-105 duration-300"
                                    />
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex md:items-center md:space-x-8 flex-1 justify-center">
                                {navigationLinks.map((item) =>
                                    item.type === 'link' ? (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                router.pathname === item.href ? 'text-secondary font-bold' : 'text-gray-600 font-medium hover:text-secondary',
                                                'text-[15px] tracking-wide uppercase font-sora transition-colors duration-200 relative group'
                                            )}
                                        >
                                            {item.name}
                                            {/* خط سفلي يظهر عند التحويم */}
                                            <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${router.pathname === item.href ? 'scale-x-100' : ''}`}></span>
                                        </Link>
                                    ) : (
                                        <Menu as="div" className="relative" key={item.name}>
                                            <Menu.Button className={classNames(
                                                router.pathname.startsWith(item.href) ? 'text-secondary font-bold' : 'text-gray-600 font-medium hover:text-secondary',
                                                'flex items-center text-[15px] tracking-wide uppercase font-sora transition-colors duration-200 group'
                                            )}>
                                                {item.name}
                                                <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-secondary transition-transform duration-200" aria-hidden="true" />
                                            </Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-2"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-2"
                                            >
                                                <Menu.Items className="absolute left-0 mt-4 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-black/5 focus:outline-none py-2 overflow-hidden">
                                                    {item.subLinks.map((subLink) => (
                                                        <Menu.Item key={subLink.name}>
                                                            {({ active }) => (
                                                                <Link
                                                                    href={subLink.href}
                                                                    className={classNames(
                                                                        active ? 'bg-gray-50 text-secondary' : 'text-gray-600',
                                                                        router.pathname === subLink.href ? 'font-bold text-secondary bg-gray-50/50' : 'font-medium',
                                                                        'block px-5 py-3 text-sm transition-colors'
                                                                    )}
                                                                >
                                                                    {subLink.name}
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    )
                                )}
                            </div>

                            {/* Search & Mobile Toggle */}
                            <div className="flex items-center">
                                <div className="hidden md:block w-64 lg:w-72">
                                    <SearchWidget allRecipesData={allRecipesForSearch} placeholder={t('search_placeholder')} />
                                </div>
                                <div className="md:hidden ml-4">
                                    <Disclosure.Button className="bg-gray-50 p-2 rounded-xl text-gray-500 hover:text-secondary hover:bg-gray-100 focus:outline-none transition-colors">
                                        <span className="sr-only">{t('open_main_menu')}</span>
                                        {open ? <XIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <Disclosure.Panel className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full">
                        <div className="px-4 pt-4 pb-6 space-y-2">
                            <div className="mb-6">
                                <SearchWidget allRecipesData={allRecipesForSearch} placeholder="Sök recept..." />
                            </div>
                            {navigationLinks.map((item) =>
                                item.type === 'link' ? (
                                    <Disclosure.Button
                                        key={item.name}
                                        as={Link}
                                        href={item.href}
                                        className={classNames(
                                            router.pathname === item.href ? 'bg-secondary/10 text-secondary border-l-4 border-secondary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                                            'block px-4 py-3 text-base font-bold uppercase tracking-wider font-sora rounded-r-lg transition-colors'
                                        )}
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ) : (
                                    <Disclosure key={item.name} as="div" className="space-y-1">
                                        {({ open: subOpen }) => (
                                            <>
                                                <Disclosure.Button className="w-full flex items-center justify-between px-4 py-3 text-base font-bold uppercase tracking-wider font-sora text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
                                                    <span>{item.name}</span>
                                                    <ChevronDownIcon className={`${subOpen ? 'transform rotate-180' : ''} h-5 w-5 transition-transform`} />
                                                </Disclosure.Button>
                                                <Disclosure.Panel className="px-4 pb-2 space-y-1">
                                                    {item.subLinks.map((subLink) => (
                                                        <Disclosure.Button
                                                            key={subLink.name}
                                                            as={Link}
                                                            href={subLink.href}
                                                            className={classNames(
                                                                router.pathname === subLink.href ? 'text-secondary font-bold bg-gray-50' : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-800',
                                                                'block px-4 py-2.5 text-sm rounded-lg transition-colors'
                                                            )}
                                                        >
                                                            {subLink.name}
                                                        </Disclosure.Button>
                                                    ))}
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                )
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
};

export default PageHeader;