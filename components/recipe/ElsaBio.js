import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ElsaBio = ({ t }) => { 
    const translate = t || ((key) => key);

    return (
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 relative text-center">
            {/* زخرفة خلفية خفيفة */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-secondary/10 to-transparent rounded-t-[2rem] pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold font-sora text-secondary mb-6 relative z-10">
                {translate('from_elsas_kitchen')}
            </h2>
            
            <div className="mb-6 flex justify-center relative z-10">
                <div className="p-2 bg-white rounded-full shadow-md border border-gray-50">
                    <Image
                        src="/images/elsa-placeholder.jpg"
                        alt="Elsa Lundström"
                        width={120}
                        height={120}
                        className="rounded-full object-cover"
                    />
                </div>
            </div>
            
            {/* استخدمنا <p> العادية بدلاً من Paragraph الخاصة بـ flotiq */}
            <p className="text-[15px] md:text-base text-gray-600 leading-relaxed mb-4 relative z-10">
                Hej kära bakvänner! Jag heter Elsa Lundström, och det är med stor glädje jag delar med mig av mina
                favoritrecept här på Silviakaka.se. Jag växte upp på landsbygden i Småland där köket alltid var
                fyllt av doften av nybakat. Min mormor lärde mig allt om svenska fikaklassiker, en tradition
                jag nu för vidare med en nypa modern känsla.
            </p>
            
            <p className="text-[15px] md:text-base text-gray-600 leading-relaxed relative z-10">
                Min filosofi är enkel: bakning ska vara roligt, tillgängligt och fyllt av kärlek.
                Jag hoppas kunna inspirera dig att skapa egna ljuvliga bakverk och minnen i köket.
                <Link href="/om-oss" className="text-secondary hover:text-orange-500 transition-colors font-bold ml-1">
                    Läs mer om mig här!
                </Link>
            </p>
        </div>
    );
};

export default ElsaBio;