'use client';
import { useState, useEffect, useRef } from 'react';
import { FiChevronRight, FiChevronDown, FiPlus, FiEdit, FiTrash2, FiFolder, FiFolderPlus, FiMinusSquare, FiPlusSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CategoryModal from './CategoryModal';
import ConfirmModal from '@/components/shared/ConfirmModal';

// Utility to get display name from category (handles both string and object)
function getCategoryDisplayName(cat) {
    if (!cat) return '';
    if (typeof cat.name === 'object') {
        return cat.name.ca || cat.name.es || '';
    }
    return cat.name || '';
}
export default function CategoriesTree() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [parentCategory, setParentCategory] = useState(null);
    const [lastModifiedCategoryId, setLastModifiedCategoryId] = useState(null);
    const treeContainerRef = useRef(null);
    // Load expanded state from localStorage on initial render
    useEffect(() => {
        try {
            const savedExpandedState = localStorage.getItem('expandedCategories');
            if (savedExpandedState) {
                setExpandedCategories(JSON.parse(savedExpandedState));
            }
        } catch (error) {
            console.error('Error loading expanded state from localStorage:', error);
        }
    }, []);
    // Save expanded state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('expandedCategories', JSON.stringify(expandedCategories));
        } catch (error) {
            console.error('Error saving expanded state to localStorage:', error);
        }
    }, [expandedCategories]);
    // Scroll to the last modified category when it changes
    useEffect(() => {
        if (lastModifiedCategoryId && treeContainerRef.current) {
            setTimeout(() => {
                const categoryElement = treeContainerRef.current.querySelector(`[data-id="${lastModifiedCategoryId}"]`);
                if (categoryElement) {
                    categoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the element briefly
                    categoryElement.classList.add('bg-blue-50');
                    setTimeout(() => {
                        categoryElement.classList.remove('bg-blue-50');
                    }, 1500);
                }
            }, 300);
        }
    }, [lastModifiedCategoryId, categories]);
    // Fetch root categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);
    // Function to organize categories into a proper hierarchy
    const organizeCategories = (allCategories) => {
        const categoriesMap = {};
        const rootCategories = [];
        // First pass: create a map of all categories by ID
        allCategories.forEach(category => {
            // Migrate name if needed: if name is a string, convert to { es, ca }
            let migratedName = category.name;
            if (typeof category.name === 'string') {
                migratedName = { es: category.name, ca: '' };
            } else if (!category.name?.es && category.name?.ca) {
                migratedName = { es: '', ca: category.name.ca };
            } else if (!category.name?.ca && category.name?.es) {
                migratedName = { es: category.name.es, ca: '' };
            } else if (!category.name?.es && !category.name?.ca) {
                migratedName = { es: '', ca: '' };
            }
            categoriesMap[category._id] = {
                ...category,
                name: migratedName,
                children: []
            };
        });
        // Second pass: build the hierarchy
        allCategories.forEach(category => {
            if (category.parent && categoriesMap[category.parent]) {
                // This is a child category, add it to its parent's children
                categoriesMap[category.parent].children.push(categoriesMap[category._id]);
            } else {
                // This is a root category (no parent or parent not found)
                rootCategories.push(categoriesMap[category._id]);
            }
        });
        return rootCategories;
    };
    const fetchCategories = async (parentId = null) => {
        try {
            setLoading(true);
            // Get all categories (flat list) to properly build the hierarchy
            const url = '/api/categories?flat=true';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            console.log('Fetched categories (raw):', data);
            // Organize into proper hierarchy
            const organizedCategories = organizeCategories(data);
            console.log('Organized categories:', organizedCategories);
            setCategories(organizedCategories);
            // Don't automatically overwrite expanded state here to preserve 
            // user's previous choices from localStorage
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories');
        } finally {
            setLoading(false);
        }
    };
    // Expand or collapse all categories
    const toggleAllCategories = (expand = true) => {
        const newExpandedState = {};
        const processCategories = (cats) => {
            cats.forEach(cat => {
                if (cat.children && cat.children.length > 0) {
                    newExpandedState[cat._id] = expand;
                    processCategories(cat.children);
                }
            });
        };
        processCategories(categories);
        setExpandedCategories(newExpandedState);
    };
    const toggleCategory = (categoryId, e) => {
        if (e) e.stopPropagation();
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };
    const handleAddCategory = (parentCat = null, e) => {
        if (e) e.stopPropagation();
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
            // Defensiu: sempre envia el nom com {es, ca}
            let migratedName = categoryData.name;
            if (typeof migratedName === 'string') {
                migratedName = { es: migratedName, ca: '' };
            } else if (!migratedName?.es && migratedName?.ca) {
                migratedName = { es: '', ca: migratedName.ca };
            } else if (!migratedName?.ca && migratedName?.es) {
                migratedName = { es: migratedName.es, ca: '' };
            } else if (!migratedName?.es && !migratedName?.ca) {
                migratedName = { es: '', ca: '' };
            }
            const submissionData = {
                ...categoryData,
                name: migratedName
            };
            const isEditing = !!submissionData._id;
            const url = isEditing
                ? `/api/categories/${submissionData._id}`
                : '/api/categories';
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error desant la categoria');
            }
            const savedCategory = await response.json();
            toast.success(isEditing ? 'Categoria actualitzada' : 'Categoria creada');
            setShowAddModal(false);
            setShowEditModal(false);
            // Expandeix automàticament la categoria pare quan s'afegeix una subcategoria
            if (!isEditing && submissionData.parent) {
                setExpandedCategories(prev => ({
                    ...prev,
                    [submissionData.parent]: true
                }));
            }
            // Marca la darrera categoria modificada per fer scroll
            setLastModifiedCategoryId(savedCategory._id || submissionData._id);
            // Torna a carregar l'arbre complet per actualitzar la vista
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.message || 'Error desant la categoria');
        }
    };
    const deleteCategory = async () => {
        if (!selectedCategory) return;
        try {
            // Desa l'ID del pare abans d'eliminar
            const parentId = selectedCategory.parent;
            const response = await fetch(`/api/categories/${selectedCategory._id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error eliminant la categoria');
            }
            toast.success('Categoria eliminada');
            setShowDeleteModal(false);
            // Marca la categoria pare com a darrera modificada per fer scroll
            if (parentId) {
                setLastModifiedCategoryId(parentId);
            }
            fetchCategories(); // Refresca les categories
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Error eliminant la categoria');
        }
    };
    // Recursive component to render a category and its children
    const CategoryItem = ({ category, level = 0 }) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedCategories[category._id];
        const isLastModified = category._id === lastModifiedCategoryId;
        let displayName = '';
        try {
            displayName = getCategoryDisplayName(category);
        } catch (e) {
            displayName = '';
        }
        return (
            <div
                className={`category-item transition-colors duration-500 ${isLastModified ? 'bg-blue-50' : ''}`}
                data-id={category._id}
                data-level={level}
            >
                <div
                    className={`flex items-center py-2 pr-2 hover:bg-gray-100 group relative`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                >
                    {hasChildren ? (
                        <button
                            className="mr-1 focus:outline-none p-1 hover:bg-gray-200 rounded-full cursor-pointer"
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
                    <span className="flex-grow font-medium text-lg cursor-pointer">
                        {displayName}
                        <span className="ml-2 text-xs text-gray-400">
                            {level > 0 ? `(Nivell ${level + 1})` : ''}
                        </span>
                    </span>
                    <div className="flex items-center space-x-1 invisible group-hover:visible transition-all absolute right-2">
                        <button
                            className="p-1 text-[#00abc2] hover:text-[#00B0C8] rounded cursor-pointer"
                            onClick={(e) => handleAddCategory(category, e)}
                            title="Afegir subcategoria"
                        >
                            <FiFolderPlus size={20} />
                        </button>
                        <button
                            className="p-1 text-yellow-600 hover:text-yellow-700 rounded cursor-pointer"
                            onClick={(e) => handleEditCategory(category, e)}
                            title="Editar categoria"
                        >
                            <FiEdit size={20} />
                        </button>
                        <button
                            className="p-1 text-red-600 hover:text-red-700 rounded cursor-pointer"
                            onClick={(e) => handleDeleteCategory(category, e)}
                            title="Eliminar categoria"
                        >
                            <FiTrash2 size={20} />
                        </button>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div>
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
                <h3 className="text-lg font-medium">Categories</h3>
                <div className="flex items-center space-x-2">
                    <div className="flex border border-gray-300 rounded overflow-hidden">
                        <button
                            onClick={() => toggleAllCategories(true)}
                            className="flex items-center text-xs p-1 text-gray-700 bg-gray-100 hover:bg-gray-200 border-r border-gray-300 cursor-pointer"
                            title="Expandeix totes"
                        >
                            <FiPlusSquare size={14} className="mr-1" /> Expandeix
                        </button>
                        <button
                            onClick={() => toggleAllCategories(false)}
                            className="flex items-center text-xs p-1 text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            title="Col·lapsa totes"
                        >
                            <FiMinusSquare size={14} className="mr-1" /> Col·lapsa
                        </button>
                    </div>
                    <button
                        onClick={() => handleAddCategory(null)}
                        className="flex items-center text-sm px-3 py-1 bg-[#00B0C8] text-white rounded hover:bg-[#008A9B] cursor-pointer"
                    >
                        <FiPlus className="mr-1" /> Afegir categoria
                    </button>
                </div>
            </div>
            {/* Tree View */}
            <div ref={treeContainerRef} className="p-4 max-h-[550px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center my-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00B0C8]"></div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center text-gray-500 my-4">
                        No hi ha categories. Crea una nova categoria per començar.
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
                    category={(() => {
                        // Always pass a migrated name object
                        if (!selectedCategory) return undefined;
                        if (typeof selectedCategory.name === 'object' && (selectedCategory.name.ca || selectedCategory.name.es)) {
                            return selectedCategory;
                        }
                        // If name is string or invalid, migrate to object
                        return { ...selectedCategory, name: { es: selectedCategory.name || '', ca: '' } };
                    })()}
                    isEditing
                />
            )}
            {showDeleteModal && (
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={deleteCategory}
                    title="Eliminar Categoria"
                    message={`Estàs segur que vols eliminar la categoria "${getCategoryDisplayName(selectedCategory)}"? Aquesta acció no es pot desfer.`}
                    confirmText="Elimina"
                    cancelText="Cancel·la"
                />
            )}
        </div>
    );
} 