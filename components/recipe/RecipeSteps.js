import React from 'react';
import Image from 'next/image';
import FlotiqImage from '../../lib/FlotiqImage';

const RecipeSteps = ({ additionalClass = [], steps, headerText }) => (
    <div className={['w-full max-w-3xl mx-auto', ...additionalClass].join(' ')}>
        <h2 className="uppercase tracking-widest text-[11px] font-extrabold text-gray-400 mb-8 border-b border-gray-100 pb-4">
            {headerText}
        </h2>
        
        <div className="space-y-10">
            {steps.map((step, index) => (
                <div key={index} className="relative">
                    <div className="flex items-start mb-2">
                        {/* رقم الخطوة بحجم أصغر وأنيق */}
                        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-secondary/10 text-secondary font-bold text-xs mr-4 mt-0.5 shadow-sm border border-secondary/20">
                            {index + 1}
                        </span>
                        
                        <div className="flex-1">
                            <p className="text-base text-gray-700 leading-relaxed font-medium">
                                {step.step}
                            </p>

                            {step.image && step.image[0] && (
                                <div className="rounded-xl overflow-hidden shadow-sm mt-4 mb-2 border border-gray-100">
                                    <Image
                                        src={FlotiqImage.getSrc(step.image[0], 800, 600)}
                                        width={800}
                                        height={500}
                                        style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                                        alt={`Bild för steg ${index + 1}`}
                                        className="hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default RecipeSteps;