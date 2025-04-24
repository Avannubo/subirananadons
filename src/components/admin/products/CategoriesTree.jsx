'use client';
import { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronDown, FiPlus, FiEdit, FiTrash2, FiFolder, FiFolderPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CategoryModal from './CategoryModal';
import ConfirmModal from '@/components/shared/ConfirmModal';

export default function CategoriesTree() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [parentCategory, setParentCategory] = useState(null);

    // Fetch root categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (parentId = null) => {
        try {
            setLoading(true);
            const url = parentId
                ? `/api/categories?parent=${parentId}`
                : '/api/categories?parent=root&includeChildren=true';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId, e) => {
        if (e) e.stopPropagation();
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const handleAddCategory = (parentCat = null) => {
        setParentCategory(parentCat);
        setShowAddModal(true);
    };

    const handleEditCategory = (category, e) => {
        if (e) e.stopPropagation();
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleDeleteCategory = (category, e) => {
        if (e) e.stopPropagation();
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const saveCategory = async (categoryData) => {
        try {
            const isEditing = !!categoryData._id;
            const url = isEditing
                ? `/api/categories/${categoryData._id}`
                : '/api/categories';

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error saving category');
            }

            toast.success(isEditing ? 'Category updated' : 'Category created');
            setShowAddModal(false);
            setShowEditModal(false);
            fetchCategories(); // Refresh categories
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.message || 'Error saving category');
        }
    };

    const deleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            const response = await fetch(`/api/categories/${selectedCategory._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error deleting category');
            }

            toast.success('Category deleted');
            setShowDeleteModal(false);
            fetchCategories(); // Refresh categories
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Error deleting category');
        }
    };

    // Recursive component to render a category and its children
    const CategoryItem = ({ category, level = 0 }) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories[category._id];

        return (
            <div className="category-item">
                <div
                    className={`flex items-center py-2 pl-${level * 4} pr-2 hover:bg-gray-100 group cursor-pointer`}
                    onClick={() => handleEditCategory(category)}
                >
                    {hasChildren ? (
                        <button
                            className="mr-1 focus:outline-none p-1 hover:bg-gray-200 rounded-full"
                            onClick={(e) => toggleCategory(category._id, e)}
                        >
                            {isExpanded ?
                                <FiChevronDown className="text-gray-500" /> :
                                <FiChevronRight className="text-gray-500" />
                            }
                        </button>
                    ) : (
                        <span className="mr-1 w-5"></span>
                    )}

                    <FiFolder className="mr-2 text-gray-400" />

                    <span className="flex-grow font-medium text-sm">
                        {category.name}
                    </span>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            className="p-1 text-gray-500 hover:text-[#00B0C8]"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddCategory(category);
                            }}
                            title="Add subcategory"
                        >
                            <FiFolderPlus size={16} />
                        </button>
                        <button
                            className="p-1 text-gray-500 hover:text-yellow-600"
                            onClick={(e) => handleEditCategory(category, e)}
                            title="Edit category"
                        >
                            <FiEdit size={16} />
                        </button>
                        <button
                            className="p-1 text-gray-500 hover:text-red-600"
                            onClick={(e) => handleDeleteCategory(category, e)}
                            title="Delete category"
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-4">
                        {category.children.map(child => (
                            <CategoryItem
                                key={child._id}
                                category={child}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="categories-tree bg-white rounded-lg shadow">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
                <h3 className="text-lg font-medium">Categorías</h3>
                <button
                    onClick={() => handleAddCategory(null)}
                    className="flex items-center text-sm px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#008A9B]"
                >
                    <FiPlus className="mr-1" /> Añadir categoría
                </button>
            </div>

            {/* Tree View */}
            <div className="p-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center my-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B0C8]"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center text-gray-500 my-4">
                        No hay categorías. Crea una nueva categoría para empezar.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {categories.map(category => (
                            <CategoryItem key={category._id} category={category} />
                        ))}
                    </div>
                )}
            </div>

            {/* Category Modals */}
            {showAddModal && (
                <CategoryModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={saveCategory}
                    parent={parentCategory}
                />
            )}

            {showEditModal && selectedCategory && (
                <CategoryModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={saveCategory}
                    category={selectedCategory}
                    isEditing
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={deleteCategory}
                    title="Eliminar Categoría"
                    message={`¿Estás seguro de que deseas eliminar la categoría "${selectedCategory?.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
} 