// components/RichTextEditor.js
import React from 'react';
import 'react-quill/dist/quill.snow.css'; // استيراد الأنماط الأساسية للمحرر

// سنقوم باستيراد المحرر ديناميكياً لتجنب مشاكل الـ SSR (Server-Side Rendering)
// لأن المحرر يعتمد على كائنات المتصفح مثل `window`.
import dynamic from 'next/dynamic';

const QuillNoSSR = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Laddar redigerare...</p>,
});

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],        // أدوات التنسيق
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        ['link', 'blockquote'],                           // رابط، اقتباس
        ['clean']                                         // إزالة التنسيق
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'script',
    'link', 'blockquote'
];

const RichTextEditor = ({ value, onChange }) => {
    return (
        <div className="bg-white">
            <QuillNoSSR
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Skriv din text här..."
            />
        </div>
    );
};

export default RichTextEditor;