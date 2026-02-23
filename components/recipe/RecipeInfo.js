import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import { PlusCircleIcon, MinusCircleIcon, UserGroupIcon } from '@heroicons/react/outline';

const parseServings = (servingString) => {
    if (!servingString) return 4;
    const match = servingString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 4;
};

const formatAmount = (num) => {
    if (isNaN(num)) return '';
    return (Math.round(num * 100) / 100).toString();
};

const RecipeInfo = ({ recipe }) => {
    const { t } = useTranslation();
    const originalServings = useMemo(() => parseServings(recipe.servings), [recipe.servings]);
    const [currentServings, setCurrentServings] = useState(originalServings);

    const handleIncrease = useCallback(() => setCurrentServings(prev => prev + 1), []);
    const handleDecrease = useCallback(() => setCurrentServings(prev => (prev > 1 ? prev - 1 : 1)), []);

    return (
        <div className="bg-white p-5 md:p-7 rounded-[2rem] shadow-sm border border-gray-100">
            
            <div className="flex flex-col xl:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <h2 className="uppercase tracking-widest text-[11px] font-extrabold text-gray-400 m-0">
                    {t('ingredients')}
                </h2>
                
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-2xl border border-gray-100">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <button onClick={handleDecrease} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-white rounded-full transition-all shadow-sm">
                        <MinusCircleIcon className="h-4 w-4" />
                    </button>
                    <span className="font-extrabold w-6 text-center text-gray-800 text-sm">{currentServings}</span>
                    <button onClick={handleIncrease} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-white rounded-full transition-all shadow-sm">
                        <PlusCircleIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => {
                    const originalAmount = parseFloat(ingredient.amount);
                    let scaledAmountText = ingredient.amount || '';

                    if (!isNaN(originalAmount) && originalServings > 0) {
                        const scaledAmount = (originalAmount / originalServings) * currentServings;
                        scaledAmountText = formatAmount(scaledAmount);
                    }
                    
                    if (!ingredient.unit && !ingredient.amount) {
                        return (
                            <li key={index} className="pt-4 pb-1">
                                <h4 className="text-sm font-bold text-secondary font-sora inline-block relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[1px] after:bg-secondary/40">
                                    {ingredient.product}
                                </h4>
                            </li>
                        );
                    }

                    return (
                        <li key={index}>
                            <label className="relative flex items-start cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors group select-none">
                                <input type="checkbox" className="peer sr-only" />
                                <div className="mt-0.5 flex items-center justify-center w-5 h-5 border-2 border-gray-200 rounded-[4px] bg-white peer-checked:bg-secondary peer-checked:border-secondary transition-all shrink-0 group-hover:border-secondary/50">
                                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="ml-3 text-[15px] text-gray-700 peer-checked:text-gray-400 peer-checked:line-through transition-all duration-300 leading-snug">
                                    <span className="font-bold text-gray-900 peer-checked:text-gray-400 transition-colors">{scaledAmountText} {ingredient.unit}</span> {ingredient.product}
                                </span>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default RecipeInfo;