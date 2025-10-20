'use client';
import { useState } from 'react';
import { Dialog, DialogTitle } from '@headlessui/react';
import { FiX, FiEdit2 } from 'react-icons/fi';
export default function TextEditModal({ isOpen, onClose, title, content = { ca: '', es: '' }, onSave }) {
    const [editedContent, setEditedContent] = useState(content);
    const handleChange = (lang, value) => {
        setEditedContent(prev => ({
            ...prev,
            [lang]: value
        }));
    };
    const handleSubmit = () => {
        onSave(editedContent);
        onClose();
    };
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-7xl bg-white rounded-lg shadow-xl">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <DialogTitle className="text-lg font-medium text-gray-800 flex items-center">
                            <FiEdit2 className="mr-2 text-[#36A9E1]" />
                            {title}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Catalan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    CATALÀ
                                </label>
                                <textarea
                                    className="w-full h-[calc(100vh-300px)] p-3 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                    value={editedContent.ca}
                                    onChange={(e) => handleChange('ca', e.target.value)}
                                    placeholder="Introdueix el text en català"
                                />
                            </div>
                            {/* Spanish */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                                    ESPAÑOL
                                </label>
                                <textarea
                                    className="w-full h-[calc(100vh-300px)] p-3 border border-gray-300 rounded-md focus:ring-[#36A9E1] focus:border-[#36A9E1]"
                                    value={editedContent.es}
                                    onChange={(e) => handleChange('es', e.target.value)}
                                    placeholder="Introduce el texto en español"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={onClose}
                        >
                            CANCEL·LAR
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#36A9E1] rounded-md hover:bg-[#2D8EC0]"
                            onClick={handleSubmit}
                        >
                            DESAR
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
