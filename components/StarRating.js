import React from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/outline';

const StarRating = ({ rating, totalStars = 5, starSize = "h-5 w-5" , color = "text-yellow-400" }) => {
    
    // 1. تنظيف الرقم: استبدال الفاصلة (,) بنقطة (.) إن وجدت، وتحويله إلى رقم
    let parsedRating = parseFloat(String(rating).replace(',', '.'));
    
    // 2. حماية من القيم الفارغة أو الخاطئة: إذا لم يكن رقماً، نجعله 5
    if (isNaN(parsedRating)) {
        parsedRating = 5;
    }

    // 3. حماية إضافية: التأكد أن التقييم محصور بين 0 و إجمالي النجوم (5)
    parsedRating = Math.max(0, Math.min(parsedRating, totalStars));

    const fullStars = Math.floor(parsedRating);
    const halfStar = parsedRating % 1 >= 0.5; // التحقق من وجود نصف نجمة
    
    // 4. حماية من الأطوال السالبة للمصفوفة
    const emptyStars = Math.max(0, totalStars - fullStars - (halfStar ? 1 : 0));

    return (
        <div className="flex items-center">
            {/* النجوم الممتلئة */}
            {[...Array(fullStars)].map((_, i) => (
                <StarIconSolid key={`full-${i}`} className={`${starSize} ${color}`} />
            ))}
            
            {/* نصف النجمة */}
            {halfStar && (
                <div className="relative">
                    <StarIconOutline key="half-outline" className={`${starSize} ${color}`} />
                    <div 
                        className="absolute top-0 left-0 h-full overflow-hidden" 
                        style={{ width: '50%' }}
                    >
                        <StarIconSolid key="half-solid" className={`${starSize} ${color}`} />
                    </div>
                </div>
            )}
            
            {/* النجوم الفارغة */}
            {[...Array(emptyStars)].map((_, i) => (
                <StarIconOutline key={`empty-${i}`} className={`${starSize} text-gray-300`} />
            ))}
        </div>
    );
};

export default StarRating;