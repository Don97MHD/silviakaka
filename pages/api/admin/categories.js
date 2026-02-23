// pages/api/admin/categories.js
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../../lib/category';

const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return token === 'fake-secure-token'; // نفس التوكن المستخدم للمصادقة في لوحة التحكم
};

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        switch (req.method) {
            case 'GET': {
                const categories = await getCategories();
                res.status(200).json(categories);
                break;
            }
            case 'POST': {
                const newCategory = req.body;
                // تأكد من توليد الـ slug والـ id إذا لم يكونا موجودين
                if (!newCategory.name || !newCategory.name.sv) {
                    return res.status(400).json({ message: 'Category name (sv) is required.' });
                }
                const baseName = newCategory.name.sv;
                const slug = baseName.toLowerCase().replace(/å|ä/g, 'a').replace(/ö|ø/g, 'o').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                newCategory.slug = slug;
                newCategory.id = slug; // Keep id same as slug for consistency

                delete newCategory._id; // Remove _id if present from client
                const result = await addCategory(newCategory);
                res.status(201).json({ message: 'Category added successfully!', insertedId: result.insertedId });
                break;
            }
            case 'PUT': {
                const { _id, ...updatedCategoryData } = req.body;
                if (!_id) {
                    return res.status(400).json({ message: 'Category _id is required for update.' });
                }
                 // Regenerate slug if name changed
                if (updatedCategoryData.name && updatedCategoryData.name.sv) {
                     const baseName = updatedCategoryData.name.sv;
                     const slug = baseName.toLowerCase().replace(/å|ä/g, 'a').replace(/ö|ø/g, 'o').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                     updatedCategoryData.slug = slug;
                     updatedCategoryData.id = slug;
                }
                const result = await updateCategory(_id, updatedCategoryData);
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'Category not found.' });
                }
                res.status(200).json({ message: 'Category updated successfully!' });
                break;
            }
            case 'DELETE': {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Category ID is required.' });
                }
                const result = await deleteCategory(id);
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Category not found.' });
                }
                res.status(200).json({ message: 'Category deleted successfully!' });
                break;
            }
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("API Error in /api/admin/categories:", error);
        res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
    }
}