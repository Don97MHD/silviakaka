import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, UserGroupIcon } from '@heroicons/react/outline';

const CustomRecipeCard = ({ cookingTime, servings, name, image, slug }) => (
    <div className="mb-6 px-3 w-full md:w-1/2 lg:w-1/3">
        <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            
            {/* التعديل هنا: استخدام aspect-square لتناسب صور 1024x1024 */}
            <Link href={`/recept/${encodeURIComponent(slug)}`} title={`Läs receptet: ${name}`} className="relative w-full aspect-square block overflow-hidden">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
            </Link>
            
            {/* المحتوى النصي */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <ClockIcon className="h-4 w-4" />
                        <span>{cookingTime.replace('PT','').replace('M', ' min')}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <UserGroupIcon className="h-4 w-4" />
                        <span>{servings}</span>
                    </div>
                </div>
                
                <Link href={`/recept/${encodeURIComponent(slug)}`} title={`Läs receptet: ${name}`} className="mb-auto">
                    <h3 className="text-xl font-bold font-sora text-gray-800 group-hover:text-secondary transition-colors leading-snug">
                        {name}
                    </h3>
                </Link>
            </div>
        </div>
    </div>
);

export default CustomRecipeCard;