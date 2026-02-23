import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { PlusIcon, TrashIcon, CogIcon, SparklesIcon, BookOpenIcon, DocumentTextIcon, PencilAltIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardCopyIcon, CollectionIcon } from '@heroicons/react/outline';
import { useTranslation } from '../context/TranslationContext';
import RichTextEditor from '../components/RichTextEditor';
import Image from 'next/image';
// --- Helper Hook for Secure API Calls ---
// --- Helper Hook for Secure API Calls (FINAL, WITH AUTO-LOGOUT) ---
const useSecureFetch = () => {
    const secureFetch = useCallback(async (url, options = {}) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : null;

        if (!token) {
            // إذا لم يكن هناك توكن، قم بتسجيل الخروج فوراً
            console.error("No token found, logging out.");
            if (typeof window !== 'undefined') {
                 localStorage.removeItem('admin-token');
                 window.location.reload(); // إعادة تحميل الصفحة ستعرض نموذج تسجيل الدخول
            }
            throw new Error('Authentication token not found.');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };
        
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            // إذا كان الخطأ هو 401، قم بتسجيل الخروج
            if (response.status === 401) {
                 console.error("Unauthorized (401) error received, logging out.");
                 if (typeof window !== 'undefined') {
                    localStorage.removeItem('admin-token');
                    window.location.reload(); // إعادة تحميل الصفحة ستعرض نموذج تسجيل الدخول
                 }
                 throw new Error('Your session has expired. You will be redirected to the login page.');
            }

            // للأخطاء الأخرى، حاول عرض رسالة من السيرفر
            const errorData = await response.json().catch(() => ({ message: `Server returned an error: ${response.status}` }));
            throw new Error(errorData.message);
        }

        // في حالة النجاح، قم بإرجاع البيانات كـ JSON
        return response.json();
    }, []);

    return secureFetch;
};


// --- ImageUploader Component ---
const ImageUploader = ({ onUpload, currentImageUrl, label }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('admin-token');


        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

             if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await res.json();
            onUpload(data.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };
    
    return (
        <div className="mt-2 p-3 border rounded-lg bg-gray-50">
             <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            {currentImageUrl && <Image src={currentImageUrl} alt="Preview" width={128} height={128} className="object-cover rounded mb-2 shadow-sm" />}

            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                ref={fileInputRef}
            />
             <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
                {uploading ? 'Laddar upp...' : 'Välj bild'}
            </button>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

// --- CategoryForm Component ---
const CategoryForm = ({ t, initialData, onSave }) => {
    const handleRichTextChange = (content, lang, field) => {
    setCategory(prev => ({
        ...prev,
        [field]: { ...(prev[field] || { sv: '', en: '' }), [lang]: content }
    }));
};
    const secureFetch = useSecureFetch();
    const initialCategoryState = useMemo(() => ({ 
    id: '', 
    slug: '', 
    name: { sv: '', en: '' }, 
    description: { sv: '', en: '' }, 
    meta_description: { sv: '', en: '' }, 
    title: { sv: '', en: '' } 
}), []);
    const [category, setCategory] = useState(initialData || initialCategoryState);
    const [isEditing, setIsEditing] = useState(!!initialData);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setCategory(initialData || initialCategoryState);
        setIsEditing(!!initialData);
}, [initialData, initialCategoryState]);


    const handleChange = (e, lang, field) => {
        const { value } = e.target;
        setCategory(prev => {
            const updatedField = { ...(prev[field] || { sv: '', en: '' }), [lang]: value };
            const newState = { ...prev, [field]: updatedField };
            
            if (field === 'name' && lang === 'sv') {
                const slug = value.toLowerCase().replace(/å|ä/g, 'a').replace(/ö|ø/g, 'o').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                newState.slug = slug;
                newState.id = slug;
            }
            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = '/api/admin/categories';

        try {
            await secureFetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(category),
            });
            
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: `/kategorier/${category.slug}` }),
            });
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: `/recept` }),
            });
            await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: `/` }),
            });

            setMessage(t('admin_category_saved_successfully'));
            
            if (!isEditing) {
                setCategory(initialCategoryState);
            }
            onSave(); 
        } catch (error) {
            setMessage(t('admin_error').replace('{{errorMessage}}', error.message));
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold border-b pb-4">
                {isEditing ? t('admin_edit_category').replace('{{categoryName}}', category.name?.sv) : t('admin_add_new_category')}
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('admin_category_name')}</label>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name_sv" value={category.name?.sv || ''} onChange={e => handleChange(e, 'sv', 'name')} placeholder={t('admin_name_swedish_required')} className="p-2 border rounded" required />
                    <input name="name_en" value={category.name?.en || ''} onChange={e => handleChange(e, 'en', 'name')} placeholder={t('admin_name_english')} className="p-2 border rounded" />
                </div>
            </div>

            <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    {t('admin_url_slug')}
                    <span className="text-xs text-gray-500"> {t('admin_slug_auto_generated')}</span>
                </label>
                <input id="slug" name="slug" value={category.slug || ''} placeholder="category-slug" className="p-2 border rounded bg-gray-100 w-full mt-1" readOnly />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('admin_page_title_seo')}</label>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="title_sv" value={category.title?.sv || ''} onChange={e => handleChange(e, 'sv', 'title')} placeholder={t('admin_title_swedish')} className="p-2 border rounded" />
                    <input name="title_en" value={category.title?.en || ''} onChange={e => handleChange(e, 'en', 'title')} placeholder={t('admin_title_english')} className="p-2 border rounded" />
                </div>
            </div>
            
            <div>
    <label className="block text-sm font-medium text-gray-700">{t('admin_description_on_page')}</label>
    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <RichTextEditor value={category.description?.sv || ''} onChange={content => handleRichTextChange(content, 'sv', 'description')} />
        <RichTextEditor value={category.description?.en || ''} onChange={content => handleRichTextChange(content, 'en', 'description')} />
    </div>
</div>

<div>
    <label className="block text-sm font-medium text-gray-700">{t('admin_meta_description_seo')}</label>
    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <RichTextEditor value={category.meta_description?.sv || ''} onChange={content => handleRichTextChange(content, 'sv', 'meta_description')} />
        <RichTextEditor value={category.meta_description?.en || ''} onChange={content => handleRichTextChange(content, 'en', 'meta_description')} />
    </div>
</div>
            
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                {isEditing ? t('admin_save_changes') : t('admin_create_category')}
            </button>
            
            {message && <p className="text-center mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">{message}</p>}
        </form>
    );
};
// --- ManageCategoriesTab Component ---
// --- ManageCategoriesTab Component (Improved) ---
const ManageCategoriesTab = ({ t, onEdit, onAddNew }) => {
    const secureFetch = useSecureFetch();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await secureFetch('/api/admin/categories');
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
            }
        } catch (err) {
            setError(err.message);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [secureFetch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDelete = async (category) => {
        const confirmMessage = t('admin_confirm_delete_category').replace('{{categoryName}}', category.name.sv);
        if (window.confirm(confirmMessage)) {
            setMessage(t('admin_deleting_category'));
            try {
                await secureFetch(`/api/admin/categories?id=${category._id}`, { method: 'DELETE' });
                
                await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: `/kategorier/${category.slug}` }),
                });

                await fetchCategories();
                setMessage(t('admin_category_deleted_successfully'));
            } catch (err) {
                setMessage(t('admin_delete_failed').replace('{{errorMessage}}', err.message));
            }
        }
    };

    if (loading) return <p>{t('admin_loading')}</p>;
    if (error) return <p className="text-red-500">{t('admin_error').replace('{{errorMessage}}', error)}</p>;

    return (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{t('admin_manage_categories')} ({categories.length} {t('admin_total')})</h3>
                <button 
                    onClick={onAddNew} 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <PlusIcon className="h-5 w-5"/> {t('admin_add_new_category')}
                </button>
            </div>
            {message && <p className="text-center my-2 p-2 bg-yellow-100 text-yellow-800 rounded">{message}</p>}
            
            {categories.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg mt-4">
                    <p className="text-gray-500">{t('admin_no_categories_found')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('admin_start_by_adding_category')}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {categories.map(cat => (
                        <div key={cat._id} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                            <div>
                                <span className="font-semibold">{cat.name.sv}</span>
                                <span className="text-gray-500 text-sm ml-2">({cat.name.en || 'N/A'})</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => onEdit(cat)} className="text-blue-600 hover:underline text-sm p-1 flex items-center gap-1"><PencilAltIcon className="h-4 w-4"/> {t('admin_edit')}</button>
                                <button onClick={() => handleDelete(cat)} className="text-red-600 hover:underline text-sm p-1 flex items-center gap-1"><TrashIcon className="h-4 w-4"/> {t('admin_delete')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// --- AddRecipeForm Component ---
// --- RecipeForm Component (النسخة الكاملة والمحدثة) ---
const RecipeForm = ({ t, initialData, onSave }) => {
    const handleStepRichTextChange = (index, content) => {
    const list = [...recipe.steps];
    list[index]['step'] = content;
    setRecipe({ ...recipe, steps: list });
};
    const secureFetch = useSecureFetch();
const initialRecipeState = useMemo(() => ({
    id: '', name: '', slug: '', image: [], steps: [{ step: '', image: [] }], servings: '', cookingTime: 'PTM', prepTime: 'PTM', totalTime: 'PTM', description: '', recipeCategory: '', recipeCuisine: '', keywords: '', datePublished: new Date().toISOString().split('T')[0], ingredients: [{ unit: '', amount: '', product: '' }], aggregateRating: { "@type": "AggregateRating", "ratingValue": "4.5", "ratingCount": "1" }, nutrition: { "@type": "NutritionInformation", "calories": "" }
}), []);    
    const [recipe, setRecipe] = useState(initialData || initialRecipeState);
    const [isEditing, setIsEditing] = useState(!!initialData);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const currentData = initialData || initialRecipeState;
        setRecipe({ ...currentData, description: currentData.description || '' });
        setIsEditing(!!initialData);
   }, [initialData, initialRecipeState]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const slug = value.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setRecipe(prev => ({ ...prev, name: value, slug, id: slug }));
        } else {
             setRecipe(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleDescriptionChange = (content) => {
        setRecipe(prev => ({ ...prev, description: content }));
    };

    const handleListChange = (index, event, listName) => {
        const { name, value } = event.target;
        const list = [...recipe[listName]];
        list[index][name] = value;
        setRecipe({ ...recipe, [listName]: list });
    };

    const addListItem = (listName, item) => {
        setRecipe(prev => ({ ...prev, [listName]: [...prev[listName], item] }));
    };

    const removeListItem = (index, listName) => {
        const list = [...recipe[listName]];
        list.splice(index, 1);
        setRecipe({ ...recipe, [listName]: list });
    };
    
    const handleImageUpload = (url, listName, index) => {
        if(listName) {
            const list = [...recipe[listName]];
            list[index].image = [{ id: `step-img-${Date.now()}`, url, extension: url.split('.').pop(), width: 1200, height: 800, alt: list[index].step }];
            setRecipe({ ...recipe, [listName]: list });
        } else {
            setRecipe(prev => ({...prev, image: [{ id: `main-img-${Date.now()}`, url, extension: url.split('.').pop(), width: 1200, height: 800, alt: prev.name }]}));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const method = isEditing ? 'PUT' : 'POST';
        let recipeToSave = { ...recipe };

        if (isEditing && initialData && initialData.slug !== recipe.slug) {
            const oldSlugs = initialData.slugHistory || [];
            if (!oldSlugs.includes(initialData.slug)) {
                recipeToSave.slugHistory = [...oldSlugs, initialData.slug];
            }
        }
        
        const revalidatePaths = async (slug) => {
            const pathsToRevalidate = ['/', '/recept', '/sok', '/silviakaka', '/kladdkaka', `/recept/${slug}`];
            setMessage('بدء تحديث صفحات الموقع... قد يستغرق الأمر لحظات.');
            for (const path of pathsToRevalidate) {
                try {
                    await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: path }),
                    });
                } catch (err) {
                    console.error(`Failed to revalidate ${path}`, err);
                }
            }
        };

        try {
            await secureFetch('/api/recipes', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeToSave),
            });

            await revalidatePaths(recipeToSave.slug);

            if (isEditing && initialData && initialData.slug !== recipeToSave.slug) {
                 await revalidatePaths(initialData.slug);
            }

            setMessage('تم حفظ الوصفة وتحديث الموقع بنجاح!');
            if (!isEditing) {
                setRecipe(initialRecipeState);
            }
            onSave();
        } catch (error) {
            setMessage(`Fel: ${error.message}`);
        }
    };

    const handleJsonImport = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                const importedRecipe = JSON.parse(e.target.result);
                if(importedRecipe.name && importedRecipe.slug){
                    setRecipe(importedRecipe);
                    setMessage(t('recipe_form_recipe_loaded'));
                } else {
                    throw new Error("Invalid JSON structure.")
                }
            } catch (error) {
                 setMessage(t('recipe_form_import_error').replace('{{errorMessage}}', error.message));
            }
        };
    };

    return (
        <div className="space-y-8">
           <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{isEditing ? t('recipe_form_edit_recipe').replace('{{recipeName}}', recipe.name) : t('add_new_recipe')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={recipe.name} onChange={handleChange} placeholder={t('recipe_name')} className="p-2 border rounded" required />
                    <input name="slug" value={recipe.slug} placeholder={t('url_slug')} className="p-2 border rounded bg-gray-100" readOnly />
                </div>
                
                <ImageUploader onUpload={(url) => handleImageUpload(url)} currentImageUrl={recipe.image?.[0]?.url} label={t('main_image')} />
                
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')}</label>
                    <RichTextEditor value={recipe.description} onChange={handleDescriptionChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-6 mt-6">
                    <div>
                        <label htmlFor="servings" className="block text-sm font-medium text-gray-700">{t('servings')}</label>
                        <input type="text" name="servings" id="servings" value={recipe.servings || ''} onChange={handleChange} placeholder="ex: 10-12 bitar" className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">{t('prep_time')}</label>
                        <input type="text" name="prepTime" id="prepTime" value={recipe.prepTime || ''} onChange={handleChange} placeholder="ex: PT20M" className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">{t('cook_time')}</label>
                        <input type="text" name="cookingTime" id="cookingTime" value={recipe.cookingTime || ''} onChange={handleChange} placeholder="ex: PT35M" className="w-full p-2 border rounded mt-1" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label htmlFor="recipeCategory" className="block text-sm font-medium text-gray-700">{t('categories')} (kommaseparerade)</label>
                        <input type="text" name="recipeCategory" id="recipeCategory" value={recipe.recipeCategory || ''} onChange={handleChange} placeholder="ex: Mjuk kaka, Fika, Långpannekaka" className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label htmlFor="recipeCuisine" className="block text-sm font-medium text-gray-700">{t('recipeCuisine')}</label>
                        <input type="text" name="recipeCuisine" id="recipeCuisine" value={recipe.recipeCuisine || ''} onChange={handleChange} placeholder="ex: Svensk" className="w-full p-2 border rounded mt-1" />
                    </div>
                </div>
                <div className="mt-4">
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">{t('keywords')} (kommaseparerade)</label>
                    <input type="text" name="keywords" id="keywords" value={recipe.keywords || ''} onChange={handleChange} placeholder="ex: silviakaka, kaka, glasyr" className="w-full p-2 border rounded mt-1" />
                </div>
                
                <div>
                    <h4 className="font-semibold mb-2">{t('ingredients')}</h4>
                    {recipe.ingredients.map((ing, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input name="amount" value={ing.amount || ''} onChange={e => handleListChange(index, e, 'ingredients')} placeholder={t('recipe_form_amount')} type="text" className="p-2 border rounded w-1/4" />
                            <input name="unit" value={ing.unit || ''} onChange={e => handleListChange(index, e, 'ingredients')} placeholder={t('recipe_form_unit')} className="p-2 border rounded w-1/4" />
                            <input name="product" value={ing.product || ''} onChange={e => handleListChange(index, e, 'ingredients')} placeholder={t('recipe_form_ingredient')} className="p-2 border rounded w-2/4" required/>
                            <button type="button" onClick={() => removeListItem(index, 'ingredients')}><TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700"/></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addListItem('ingredients', { unit: '', amount: '', product: '' })} className="text-blue-600 text-sm flex items-center gap-1 hover:underline"><PlusIcon className="h-4 w-4"/> {t('add_ingredient')}</button>
                </div>
                
                <div>
                    <h4 className="font-semibold mb-2">{t('steps')}</h4>
                    {recipe.steps.map((step, index) => (
                         <div key={index} className="mb-4 p-3 border rounded bg-gray-50">
                            <div className="flex items-start gap-2">
    <RichTextEditor value={step.step} onChange={content => handleStepRichTextChange(index, content)} />
    <button type="button" onClick={() => removeListItem(index, 'steps')} className="mt-2"><TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700"/></button>
</div>
                            <ImageUploader onUpload={(url) => handleImageUpload(url, 'steps', index)} currentImageUrl={step.image?.[0]?.url} label={t('recipe_form_optional_step_image')}/>
                         </div>
                    ))}
                     <button type="button" onClick={() => addListItem('steps', { step: '', image: [] })} className="text-blue-600 text-sm flex items-center gap-1 hover:underline"><PlusIcon className="h-4 w-4"/> {t('add_step')}</button>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">{t('save_recipe')}</button>
                {message && <p className="text-center mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">{message}</p>}
            </form>
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-semibold mb-4">{t('recipe_form_import_from_json')}</h3>
                <input type="file" accept=".json" onChange={handleJsonImport} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
        </div>
    );
};

// --- SettingsForm Component ---
const SettingsForm = ({ t }) => {
    const secureFetch = useSecureFetch();
    const [settings, setSettings] = useState({ title: '', description: '', logo: '', favicon: '', language: 'sv' });
    const [adminSettings, setAdminSettings] = useState({ aiApiUrl: '' });
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await secureFetch('/api/settings');
                if (data.siteConfig) setSettings(data.siteConfig);
                if (data.adminConfig) setAdminSettings(data.adminConfig);
            } catch (error) {
                setMessage(t('admin_error').replace('{{errorMessage}}', error.message));
            }
        };
        fetchSettings();
    }, [secureFetch, t]);

    const handleSettingsChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });
    const handleAdminSettingsChange = (e) => setAdminSettings({ ...adminSettings, [e.target.name]: e.target.value });
    const handleLogoUpload = (url) => setSettings({ ...settings, logo: url });
    const handleFaviconUpload = (url) => setSettings({ ...settings, favicon: url });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await secureFetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteConfig: settings, newPassword, aiApiUrl: adminSettings?.aiApiUrl }),
            });
            setMessage(t('settings_form_save_success'));
            setNewPassword('');
        } catch (error) {
            setMessage(t('admin_error').replace('{{errorMessage}}', error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
             <h3 className="text-xl font-semibold">{t('settings_form_general_settings')}</h3>
             <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">{t('settings_form_site_language')}</label>
                <select id="language" name="language" value={settings.language} onChange={handleSettingsChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option value="sv">Svenska</option>
                    <option value="en">English</option>
                </select>
            </div>
            <input name="title" value={settings.title || ''} onChange={handleSettingsChange} placeholder={t('settings_form_site_title')} className="w-full p-2 border rounded" />
            <textarea name="description" value={settings.description || ''} onChange={handleSettingsChange} placeholder={t('settings_form_seo_description')} className="w-full p-2 border rounded" rows="3"></textarea>
            
            <ImageUploader onUpload={handleLogoUpload} currentImageUrl={settings.logo} label={t('settings_form_logo')}/>
            <ImageUploader onUpload={handleFaviconUpload} currentImageUrl={settings.favicon} label={t('settings_form_favicon')}/>
            
            <div>
                <label htmlFor="aiApiUrl" className="block text-sm font-medium text-gray-700">AI Server API URL</label>
                <input type="url" name="aiApiUrl" id="aiApiUrl" value={adminSettings?.aiApiUrl || ''} onChange={handleAdminSettingsChange} className="mt-1 w-full p-2 border rounded" placeholder="https://your-ollama-server.com" />
            </div>

             <h3 className="text-xl font-semibold mt-6 border-t pt-6">{t('settings_form_change_password')}</h3>
             <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('settings_form_new_password_placeholder')} className="w-full p-2 border rounded" />
             
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">{t('settings_form_save_settings')}</button>
            {message && <p className="text-center mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">{message}</p>}
        </form>
    );
};


// --- LoginForm Component ---
const LoginForm = ({ onLogin }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t('admin_login_error'));
            }
            const { token } = await res.json();
            localStorage.setItem('admin-token', token);
            onLogin(true);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-6 text-center">{t('admin_login_title')}</h1>
                <form onSubmit={handleSubmit}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('admin_password')} className="w-full p-3 border border-gray-300 rounded-lg mb-4"/>
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">{t('admin_login_button')}</button>
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
};
// --- PageEditorForm Component ---
// (مكون جديد بالكامل)
const PageEditorForm = ({ t }) => {
    const handlePageContentRichTextChange = (content, lang, field) => {
    setCurrentPageContent(prev => ({
        ...prev,
        [field]: {
            ...(prev[field] || {}), // Ensure field object exists
            [lang]: content
        }
    }));
};
    const secureFetch = useSecureFetch();
    const [allPages, setAllPages] = useState(null);
    const [selectedPageKey, setSelectedPageKey] = useState('about');
    const [currentPageContent, setCurrentPageContent] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPageContent = async () => {
            try {
                const data = await secureFetch('/api/admin/pages');
                setAllPages(data);
                setCurrentPageContent(data[selectedPageKey]);
            } catch (error) {
                setMessage(t('admin_error').replace('{{errorMessage}}', error.message));
            }
        };
        fetchPageContent();
    }, []);

    useEffect(() => {
        if (allPages) {
            setCurrentPageContent(allPages[selectedPageKey]);
        }
    }, [selectedPageKey, allPages]);

    const handleContentChange = (e, lang, field) => {
        const { value } = e.target;
        setCurrentPageContent(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [lang]: value
            }
        }));
    };

    const handleSimpleChange = (e, field) => {
        const { value } = e.target;
        setCurrentPageContent(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await secureFetch('/api/admin/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageKey: selectedPageKey, newContent: currentPageContent }),
            });
            setMessage(t('page_editor_update_success'));
        } catch (error) {
            setMessage(t('page_editor_update_error'));
        }
    };

    if (!currentPageContent) {
        return <p>{t('admin_loading')}</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{t('page_editor_title')}</h3>
            
            <div>
                <label htmlFor="page-select" className="block text-sm font-medium text-gray-700">{t('page_editor_select_page')}</label>
                <select id="page-select" value={selectedPageKey} onChange={(e) => setSelectedPageKey(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    {Object.keys(allPages).map(key => (
                        <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                    ))}
                </select>
            </div>

            {Object.entries(currentPageContent).map(([field, value]) => (
                <div key={field}>
                    <h4 className="font-semibold capitalize">{field.replace('_', ' ')}</h4>
                    {typeof value === 'object' ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
   <RichTextEditor value={value.sv || ''} onChange={content => handlePageContentRichTextChange(content, 'sv', field)} />
   <RichTextEditor value={value.en || ''} onChange={content => handlePageContentRichTextChange(content, 'en', field)} />
</div>
                    ) : (
                        <input type="text" value={value} onChange={e => handleSimpleChange(e, field)} className="w-full p-2 border rounded mt-2"/>
                    )}
                </div>
            ))}
            
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">{t('page_editor_save_content')}</button>
            {message && <p className="text-center mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">{message}</p>}
        </form>
    );
};
// --- ManageRecipesTab Component ---
// (مكون جديد بالكامل)
    const ManageRecipesTab = ({ t, onEdit }) => {
    const secureFetch = useSecureFetch();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 20;
    const [message, setMessage] = useState('');

    const fetchRecipes = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await secureFetch('/api/recipes');
            setRecipes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [secureFetch]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

      const handleDelete = async (recipeId, recipeName) => {
        if (window.confirm(`Är du säker på att du vill ta bort receptet "${recipeName}"?`)) {
            try {
                const recipeToDelete = recipes.find(r => r._id === recipeId);
                setMessage('جارٍ حذف الوصفة وتحديث الموقع...'); 
                await secureFetch(`/api/recipes?id=${recipeId}`, { method: 'DELETE' });
                if (recipeToDelete) {
                    const pathsToRevalidate = ['/', '/recept', '/sok', '/silviakaka', '/kladdkaka', `/recept/${recipeToDelete.slug}`];
                    for (const path of pathsToRevalidate) {
                        await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET_TOKEN}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: path }),
                        });
                    }
                }
                await fetchRecipes();
                setMessage('تم حذف الوصفة وتحديث الموقع بنجاح.');
            } catch (err) {
                setMessage(`فشل الحذف: ${err.message}`);
            }
        }
    };

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(recipes.length / recipesPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <p>{t('admin_loading')}</p>;
    if (error) return <p className="text-red-500">{t('admin_error').replace('{{errorMessage}}', error)}</p>;

    return (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{t('admin_manage_recipes')} ({recipes.length} {t('admin_total')})</h3>
            {message && <p className="text-center my-2 p-2 bg-yellow-100 text-yellow-800 rounded">{message}</p>}
            <div className="space-y-2">
                {currentRecipes.map(recipe => (
                    <div key={recipe._id} className="border rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-50 flex justify-between items-center">
                            <span className="font-semibold">{recipe.name}</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => onEdit(recipe)} className="text-blue-600 hover:underline text-sm p-1 flex items-center gap-1"><PencilAltIcon className="h-4 w-4"/> {t('admin_edit')}</button>
                                <button onClick={() => handleDelete(recipe._id, recipe.name)} className="text-red-600 hover:underline text-sm p-1 flex items-center gap-1"><TrashIcon className="h-4 w-4"/> {t('admin_delete')}</button>
                                <button onClick={() => setExpandedId(expandedId === recipe._id ? null : recipe._id)}>
                                    {expandedId === recipe._id ? <ChevronUpIcon className="h-5 w-5"/> : <ChevronDownIcon className="h-5 w-5"/>}
                                </button>
                            </div>
                        </div>
                        {expandedId === recipe._id && (
                            <div className="p-4 border-t text-sm text-gray-700">
                                <p><strong>MongoDB ID:</strong> {recipe._id}</p>
                                <p><strong>Slug ID:</strong> {recipe.id}</p>
                                <p><strong>{t('datePublished')}:</strong> {new Date(recipe.datePublished).toLocaleDateString()}</p>
                                <p><strong>{t('recipeCategory')}:</strong> {recipe.recipeCategory}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 flex items-center gap-2">
                        <ChevronLeftIcon className="h-5 w-5" />
                        {t('prevText', 'Previous')}
                    </button>
                    <span className="text-sm font-semibold">
                        {t('page', 'Page')} {currentPage} {t('of', 'of')} {totalPages}
                    </span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastRecipe >= recipes.length} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 flex items-center gap-2">
                        {t('nextText', 'Next')}
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};
    // --- AIToolsTab Component ---
const AIToolsTab = ({ t }) => {
    const secureFetch = useSecureFetch();
    const [keywords, setKeywords] = useState('');
    const [generationLog, setGenerationLog] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [allRecipeNames, setAllRecipeNames] = useState([]);
    const [aiApiUrl, setAiApiUrl] = useState('');
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
    const [currentKeyword, setCurrentKeyword] = useState('');

    useEffect(() => {
        const initialFetch = async () => {
            try {
                const recipesData = await secureFetch('/api/recipes');
                if (Array.isArray(recipesData)) setAllRecipeNames(recipesData.map(r => (r.name ? r.name.toLowerCase() : '')));
                const settingsData = await secureFetch('/api/settings');
                const url = settingsData?.adminConfig?.aiApiUrl;
                if (!url) setError("AI API URL is not configured. Go to Settings.");
                else setAiApiUrl(url);
            } catch (err) {
                setError("Could not load necessary data. Check API settings.");
            }
        };
        initialFetch();
        const savedLog = localStorage.getItem('aiGenerationLog');
        if (savedLog) setGenerationLog(JSON.parse(savedLog));
    }, [secureFetch]);
    const addToLog = (logEntry) => {
        setGenerationLog(prevLog => {
            const newLog = [logEntry, ...prevLog];
            localStorage.setItem('aiGenerationLog', JSON.stringify(newLog));
            return newLog;
        });
    };
    
    const handleClearLog = () => {
        if(window.confirm(t('ai_tools_confirm_clear_log'))) {
            setGenerationLog([]);
            localStorage.removeItem('aiGenerationLog');
        }
    };

    const processSingleKeyword = async (keyword) => {
        const simplifiedKeyword = keyword.toLowerCase().trim();
        const similarRecipe = allRecipeNames.find(name => name.includes(simplifiedKeyword));

        if (similarRecipe) {
            addToLog({ status: 'skipped', keywords: keyword, message: t('ai_tools_recipe_already_exists') });
            return;
        }

const systemPrompt = `
        You are a recipe creation API. You MUST respond with only a single, valid, minified JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON object.
        Generate a complete recipe in Swedish based on the user's keyword EXAMPLE KEYWORD(silviakaka klassisk).
        The JSON object MUST have the following structure and data types:
        - id: string (lowercase, kebab-case, derived from keyword) (exmple: silviakaka-klassisk)
        - name: string (example: Silviakaka – Det Klassiska Receptet)
        - slug: string (same as id)
        - description: string (HTML allowed)
        - servings: string
        - prepTime: string (ISO 8601 format, e.g., "PT15M")
        - cookingTime: string (ISO 8601 format, e.g., "PT25M")
        - totalTime: string (ISO 8601 format, e.g., "PT40M")
        - recipeCategory: string
        - recipeCuisine: string
        - keywords: string (comma-separated)
        - datePublished: string (YYYY-MM-DD format) (we are at 06/2025)
        - ingredients: array of objects, each with { "unit": string, "amount": string, "product": string }
        - steps: array of objects, each with { "step": string, "image": [] }
        - image_alt: string (A descriptive alt text for the main image)
        - image_prompt: string (A detailed, photorealistic prompt for an AI image generator)
        - aggregateRating: object with { "@type": "AggregateRating", "ratingValue": "4.5", "ratingCount": "1" }
        - nutrition: object with { "@type": "NutritionInformation", "calories": "Cirka 350 kcal per portion" }

        All fields are required. Here is an example for a single ingredient: { "unit": "g", "amount": "100", "product": "mörk choklad" }.
        Do not add any fields that are not in this structure.
        THIS IS AN EXAMPLE ABOUT THIS KEYWORD (silviakaka) BUT YOU WILL ADD PROMPT AND EXTRA OPTIONS:
        {
    "id": "silviakaka-klassisk",
    "name": "Silviakaka – Det Klassiska Receptet",
    "slug": "silviakaka",
    "image": [
      {
        "id": "silviakaka-main-image",
        "url": "/images/recipes/silviakaka-klassisk.jpg",
        "extension": "jpg",
        "width": 1200,
        "height": 800,
        "alt": "Klassisk Silviakaka med gyllene glasyr och rikligt med kokos"
      }
    ],
    "steps": [
      {
        "step": "Sätt ugnen på 175°C (varmluft) eller 200°C (över-/undervärme). Smörj och bröa en långpanna, cirka 30x40 cm.",
        "image": []
      },
      {
        "step": "Vispa ägg och socker ljust och pösigt med elvisp.",
        "image": []
      },
      {
        "step": "Blanda vetemjöl och bakpulver i en separat skål. Vänd försiktigt ner mjölblandningen i äggsmeten.",
        "image": []
      },
      {
        "step": "Tillsätt det smälta smöret (eller oljan) och vattnet. Rör om tills smeten är jämn.",
        "image": []
      },
      {
        "step": "Häll smeten i långpannan och grädda i nedre delen av ugnen i cirka 15-20 minuter, eller tills kakan är gyllenbrun och en provsticka kommer ut torr.",
        "image": []
      },
      {
        "step": "Låt kakan svalna helt i formen innan du brer på glasyren.",
        "image": []
      },
      {
        "step": "Glasyr: Smält smöret i en kastrull. Ta kastrullen från värmen och rör ner florsocker, vaniljsocker och äggula. Vispa tills glasyren är slät och blank.",
        "image": []
      },
      {
        "step": "Bred glasyren jämnt över den kalla kakan. Strö över rikligt med kokosflingor.",
        "image": []
      },
      {
        "step": "Låt glasyren stelna något innan du skär kakan i bitar.",
        "image": []
      }
    ],
    "servings": "Ca 24 bitar (1 långpanna)",
    "cookingTime": "PT20M",
    "prepTime": "PT20M",
    "totalTime": "PT40M",
    "description": "Upptäck det klassiska receptet på Silviakaka, en älskad svensk mjuk kaka perfekt för fika och kalas. Detta enkla Silviakaka recept ger en underbart saftig vaniljbotten toppad med en krämig smörglasyr och rikligt med kokos. Lär dig baka denna favorit som ofta görs i långpanna och garanterat blir en succé. Vårt recept silviakaka är lätt att följa och ger en saftig silviakaka med den ikoniska silviakaka glasyr som alla älskar. Perfekt för både nybörjare och erfarna bagare.",
    "recipeCategory": "Mjuk kaka, Långpannekaka, Fika",
    "recipeCuisine": "Svensk",
    "keywords": "silviakaka, silviakaka recept, recept silviakaka, saftig silviakaka, silviakaka glasyr, långpanna",
    "datePublished": "2025-05-28",
    "ingredients": [
      {
        "unit": "",
        "amount": null,
        "product": "Kaka:"
      },
      {
        "unit": "st",
        "amount": 3,
        "product": "stora ägg"
      },
      {
        "unit": "dl",
        "amount": 3,
        "product": "strösocker"
      },
      {
        "unit": "dl",
        "amount": 3,
        "product": "vetemjöl"
      },
      {
        "unit": "tsk",
        "amount": 2,
        "product": "bakpulver"
      },
      {
        "unit": "tsk",
        "amount": 1,
        "product": "vaniljsocker"
      },
      {
        "unit": "dl",
        "amount": 1.5,
        "product": "kallt vatten"
      },
      {
        "unit": "g",
        "amount": 100,
        "product": "smör (smält och avsvalnat) eller 1 dl neutral olja"
      },
      {
        "unit": "",
        "amount": null,
        "product": "Glasyr:"
      },
      {
        "unit": "g",
        "amount": 150,
        "product": "smör"
      },
      {
        "unit": "dl",
        "amount": 2,
        "product": "florsocker"
      },
      {
        "unit": "msk",
        "amount": 2,
        "product": "vaniljsocker"
      },
      {
        "unit": "st",
        "amount": 1,
        "product": "äggula"
      },
      {
        "unit": "",
        "amount": null,
        "product": "Topping:"
      },
      {
        "unit": "dl",
        "amount": 2,
        "product": "kokosflingor (eller mer efter smak)"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "15"
    },
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": "Cirka 250 kcal per bit"
    }
  }
        `; 
        
    const messages = [{ role: 'system', content: systemPrompt.replace(/\s+/g, ' ').trim() }, { role: 'user', content: keyword }];

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                addToLog({ status: 'processing', keywords: keyword, message: `Generating (attempt ${attempt} of 2)...` });
                const generatedRecipe = await secureFetch('/api/admin/generate-ollama-recipe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages, aiApiUrl }),
                });

                if (!generatedRecipe || typeof generatedRecipe.name !== 'string' || !generatedRecipe.name) {
                    throw new Error("AI model returned an invalid format.");
                }

                generatedRecipe.image = [{ id: `ai-img-${Date.now()}`, url: '/images/placeholder.jpg', alt: generatedRecipe.image_alt || generatedRecipe.name, imagePrompt: generatedRecipe.image_prompt || 'No prompt generated' }];
                
                await secureFetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(generatedRecipe), });
                
                addToLog({ status: 'success', keywords: keyword, recipeName: generatedRecipe.name, imagePrompt: generatedRecipe.image[0].imagePrompt });
                setAllRecipeNames(prev => [...prev, generatedRecipe.name.toLowerCase()]);
                return;
            } catch (err) {
                if (attempt === 2) addToLog({ status: 'error', keywords: keyword, message: `Failed after 2 attempts: ${err.message}` });
                else await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    };

    const handleStartGeneration = async () => {
        const keywordsList = keywords.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        if (keywordsList.length === 0) {
            setError(t('ai_tools_error_no_keywords'));
            return;
        }

        setIsProcessing(true);
        setError('');
        setBatchProgress({ current: 0, total: keywordsList.length });
        addToLog({ status: 'info', message: t('ai_tools_batch_start_log').replace('{{count}}', keywordsList.length) });

        for (const [index, keyword] of keywordsList.entries()) {
            setCurrentKeyword(keyword);
            setBatchProgress(prev => ({ ...prev, current: index + 1 }));
            await processSingleKeyword(keyword);
        }

        setIsProcessing(false);
        setCurrentKeyword('');
        addToLog({ status: 'info', message: t('ai_tools_batch_complete_log') });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                 <h3 className="text-xl font-semibold">{t('ai_tools_batch_generator')}</h3>
                 <div>
                     <label className="block text-sm font-medium">{t('ai_tools_keywords_label')}</label>
                   <textarea
    value={keywords}
    onChange={e => setKeywords(e.target.value)}
    placeholder="t.ex. saftig morotskaka med frosting
kladdkaka med lakrits"
    className="w-full p-2 border rounded mt-1 h-32"
/>
                </div>
                <button onClick={handleStartGeneration} disabled={isProcessing} className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center gap-2">
                    {isProcessing 
                        ? t('ai_tools_processing').replace('{{current}}', batchProgress.current).replace('{{total}}', batchProgress.total).replace('{{keyword}}', currentKeyword)
: ( <><SparklesIcon className="h-5 w-5"/> {t('ai_tools_start_generation')}</> )

                    }
                </button>
                <div className="h-6 mt-2">
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{t('ai_tools_generation_log')}</h3>
                    <button onClick={handleClearLog} disabled={generationLog.length === 0} className="text-sm text-red-600 hover:underline disabled:text-gray-400">{t('ai_tools_clear_log')}</button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto border p-3 rounded-md bg-gray-50">
                    {generationLog.length === 0 ? (
                        <p className="text-gray-500">{t('ai_tools_log_no_recipes_generated')}</p>
                    ) : (
                        generationLog.map((log, index) => (
                           <div key={index} className={`p-3 rounded-md border-l-4 ${log.status === 'success' ? 'border-green-500 bg-green-50' : log.status === 'skipped' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
                               <p><strong>{t('ai_tools_log_status')}:</strong> <span className="capitalize">{log.status}</span></p>
                               <p><strong>{t('ai_tools_log_keywords')}:</strong> "{log.keywords}"</p>
                               {log.recipeName && <p><strong>{t('ai_tools_log_result')}:</strong> {log.recipeName}</p>}
                               {log.message && <p><strong>{t('ai_tools_log_info')}:</strong> {log.message}</p>}
                               {log.imagePrompt && (
                                    <div className="mt-2 text-sm">
                                        <p className="font-semibold">{t('ai_tools_log_image_prompt')}:</p>
                                        <p className="text-gray-600 p-2 bg-gray-100 rounded">{log.imagePrompt}</p>
                                    </div>
                               )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};



// --- AdminDashboard Component ---
const AdminDashboard = ({ t }) => {
    const [activeTab, setActiveTab] = useState('manage-recipes');
    const [recipeToEdit, setRecipeToEdit] = useState(null);
    const [categoryToEdit, setCategoryToEdit] = useState(null);

    const handleEditRecipe = (recipe) => {
        setRecipeToEdit(recipe);
        setActiveTab('add-edit-recipe');
    };
    
    const handleSave = () => {
        setRecipeToEdit(null);
        setActiveTab('manage-recipes');
    };

    const handleEditCategory = (category) => {
        setCategoryToEdit(category);
        setActiveTab('add-edit-category');
    };

    const handleCategorySave = () => {
        setCategoryToEdit(null);
        setActiveTab('manage-categories');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'manage-recipes': return <ManageRecipesTab t={t} onEdit={handleEditRecipe} />;
            case 'add-edit-recipe': return <RecipeForm t={t} initialData={recipeToEdit} onSave={handleSave} />;
            case 'manage-categories': 
                return <ManageCategoriesTab 
                    t={t} 
                    onEdit={handleEditCategory} 
                    onAddNew={() => { setCategoryToEdit(null); setActiveTab('add-edit-category'); }} 
                />;
            case 'add-edit-category': 
                return <CategoryForm 
                    t={t} 
                    initialData={categoryToEdit} 
                    onSave={handleCategorySave} 
                />;
            case 'pages': return <PageEditorForm t={t} />;
            case 'settings': return <SettingsForm t={t} />;
            case 'ai-tools': return <AIToolsTab t={t} onRecipeGenerated={handleEditRecipe} setActiveTab={setActiveTab} />;
            default: return null;
        }
    };

    const TabButton = ({ tabName, icon: Icon, children }) => (
        <button onClick={() => { setRecipeToEdit(null); setCategoryToEdit(null); setActiveTab(tabName); }} className={`flex items-center gap-2 py-3 px-4 rounded-t-lg transition-colors border-b-2 ${activeTab === tabName ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-600 hover:text-blue-600'}`}>
            <Icon className="h-5 w-5" />
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100">
             <header className="bg-white shadow-sm">
                {/* ... Header UI ... */}
             </header>
             <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex border-b border-gray-200 flex-wrap">
                     <TabButton tabName="manage-recipes" icon={BookOpenIcon}>{t('admin_manage_recipes')}</TabButton>
                     <TabButton tabName="manage-categories" icon={CollectionIcon}>{t('admin_manage_categories')}</TabButton>
                     <TabButton tabName="add-edit-recipe" icon={PlusIcon}>{t('admin_add_edit')}</TabButton>
                     <TabButton tabName="pages" icon={DocumentTextIcon}>{t('admin_page_management')}</TabButton>
                     <TabButton tabName="settings" icon={CogIcon}>{t('settings')}</TabButton>
                     <TabButton tabName="ai-tools" icon={SparklesIcon}>{t('ai_tools')}</TabButton>
                </div>
                <div className="mt-6">
                    {renderTabContent()}
                </div>
             </main>
        </div>
    );
};
// --- Main Admin Page Component ---
// --- Main Admin Page Component (Improved) ---
const AdminPage = ({ translations }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation(); //  t is needed here for the loading message

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (token) {
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>{t('admin_loading')}</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <meta name="robots" content="noindex, nofollow" />
                <title>Admin Panel</title>
            </Head>
            {isLoggedIn ? <AdminDashboard t={t} /> : <LoginForm onLogin={setIsLoggedIn} />}
        </>
    );
};


// We need getStaticProps here to pass translations to the page component
import { getTranslations } from '../lib/translations';

export async function getStaticProps() {
    const { translations } = await getTranslations();
    return {
        props: {
            translations,
        },
    };
}


export default AdminPage;
