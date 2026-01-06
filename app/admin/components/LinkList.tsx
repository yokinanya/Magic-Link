'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLinkAction, editLinkAction } from '../actions';
import {
    SearchIcon,
    EditIcon,
    DeleteIcon,
    LoadingSpinner,
    CheckIcon,
    CloseIcon,
    ChevronDownIcon
} from './Icons';

// Helper function to encode HTML entities to prevent XSS
function htmlEncode(str: string): string {
    return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#39;');
}

type Link = {
    _id: string;
    path: string;
    to: string;
    creater: string;
};

interface LinkListProps {
    initialLinks: Link[];
    initialPage: number;
    pageCount: number;
    searchQuery?: string;
}

export default function LinkList({ initialLinks, initialPage, pageCount, searchQuery }: LinkListProps) {
    const router = useRouter();
    const [searchField, setSearchField] = useState('path');
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchOptions: Record<string, string> = { 
        path: 'Path', 
        to: 'Destination', 
        creater: 'Creator' 
    };
    
    // Edit modal states
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newToValue, setNewToValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState('');
    
    // Delete modal states
    const [deletingLink, setDeletingLink] = useState<Link | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (searchQuery) {
            try {
                const parsedQuery = JSON.parse(searchQuery);
                if (parsedQuery.path) {
                    setSearchField('path');
                    if (typeof parsedQuery.path === 'object' && parsedQuery.path.$regex) {
                        setSearchTerm(parsedQuery.path.$regex);
                    } else {
                        setSearchTerm(parsedQuery.path);
                    }
                } else if (parsedQuery.to) {
                    setSearchField('to');
                    if (typeof parsedQuery.to === 'object' && parsedQuery.to.$regex) {
                        setSearchTerm(parsedQuery.to.$regex);
                    } else {
                        setSearchTerm(parsedQuery.to);
                    }
                } else if (parsedQuery.creater) {
                    setSearchField('creater');
                    if (typeof parsedQuery.creater === 'object' && parsedQuery.creater.$regex) {
                        setSearchTerm(parsedQuery.creater.$regex);
                    } else {
                        setSearchTerm(parsedQuery.creater);
                    }
                }
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    }, [searchQuery]);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            router.push('/admin?page=1');
            return;
        }

        const query: Record<string, any> = {};
        query[searchField] = { $regex: searchTerm, $options: 'i' };
        
        router.push(`/admin?page=1&search=${encodeURIComponent(JSON.stringify(query))}`);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.push('/admin?page=1');
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > pageCount) return;
        
        let search = '';
        if (searchTerm.trim()) {
            const query: Record<string, any> = {};
            query[searchField] = { $regex: searchTerm, $options: 'i' };
            search = `&search=${encodeURIComponent(JSON.stringify(query))}`;
        }
        
        router.push(`/admin?page=${newPage}${search}`);
    };

    const handleEdit = (link: Link) => {
        setEditingLink(link);
        setNewToValue(link.to);
        setIsEditModalOpen(true);
        setEditError('');
        // 防止页面抖动
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    };

    const handleSaveEdit = async () => {
        if (!editingLink || !newToValue.trim()) {
            setEditError('Destination URL is required');
            return;
        }

        try {
            new URL(newToValue);
        } catch (e) {
            setEditError('Please enter a valid URL');
            return;
        }

        setIsEditing(true);
        setEditError('');

        try {
            const result = await editLinkAction(editingLink.path, newToValue);
            if (result && 'error' in result && result.error) {
                setEditError(result.error);
            } else {
                setIsEditModalOpen(false);
                setEditingLink(null);
                setNewToValue('');
                // 恢复页面滚动
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }
        } catch (error) {
            setEditError('An unexpected error occurred');
        } finally {
            setIsEditing(false);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingLink(null);
        setNewToValue('');
        setEditError('');
        // 恢复页面滚动
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };

    const handleDelete = (link: Link) => {
        setDeletingLink(link);
        setIsDeleteModalOpen(true);
        // 防止页面抖动
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    };
    
    const handleConfirmDelete = async () => {
        if (!deletingLink) return;
        
        setDeletingId(deletingLink.path);
        const result = await deleteLinkAction(deletingLink.path);
        if (result && 'error' in result && result.error) {
            alert(`Failed to delete link: ${result.error}`);
        }
        setDeletingId(null);
        setIsDeleteModalOpen(false);
        setDeletingLink(null);
        // 恢复页面滚动
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };
    
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingLink(null);
        // 恢复页面滚动
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 p-1 z-20 relative">
                <div className="flex gap-2 flex-1">
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors min-w-[120px] justify-between"
                        >
                            <span>{searchOptions[searchField]}</span>
                            <ChevronDownIcon />
                        </button>
                        
                        {isDropdownOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-30" 
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 overflow-hidden animate-fade-in-up">
                                    {Object.entries(searchOptions).map(([value, label]) => (
                                        <button
                                            key={value}
                                            onClick={() => {
                                                setSearchField(value);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                searchField === value 
                                                    ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20' 
                                                    : 'text-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            placeholder="Search..."
                            className="w-full px-4 py-2 pl-9 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-all outline-none"
                        />
                         <div className="absolute left-3 top-2.5 text-gray-400">
                            <SearchIcon />
                        </div>
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-2 top-2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                    <SearchIcon />
                    <span className="hidden sm:inline">Search</span>
                </button>
            </div>
            
            {/* Search Info - Minimal */}
            {searchTerm && (
                <div className="mb-2 px-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{searchField}:</span> {searchTerm}
                </div>
            )}

            {/* Links Table - Scrollable Container */}
            <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-medium">Path</th>
                            <th scope="col" className="px-4 py-3 font-medium">Destination</th>
                            <th scope="col" className="px-4 py-3 font-medium">Creator</th>
                            <th scope="col" className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {initialLinks.map((link, index) => (
                            <tr
                                key={link._id}
                                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors animate-fade-in"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    <a href={link.path} target="_blank" className="hover:text-blue-500 font-mono text-xs">
                                        {link.path}
                                    </a>
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate text-gray-500 dark:text-gray-400" title={link.to}>
                                    {link.to}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                                            {link.creater.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 text-xs">{link.creater}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(link)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link)}
                                            disabled={deletingId === link.path}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {deletingId === link.path ? <LoadingSpinner /> : <DeleteIcon />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {initialLinks.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>No links found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Compact Pagination */}
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Page {initialPage} of {pageCount || 1}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(initialPage - 1)}
                        disabled={initialPage <= 1}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(initialPage + 1)}
                        disabled={initialPage >= pageCount}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingLink && (
                <>
                    <div
                        className="fixed inset-0 z-40 modal-backdrop animate-fade-in"
                        onClick={handleCloseEditModal}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform animate-scale-in border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Link</h3>
                                    <button
                                        onClick={handleCloseEditModal}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 interactive-transition"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Path
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{editingLink.path}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Current Destination
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md break-all">
                                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{htmlEncode(editingLink.to)}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="newTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            New Destination URL
                                        </label>
                                        <input
                                            type="text"
                                            id="newTo"
                                            value={newToValue}
                                            onChange={(e) => setNewToValue(e.target.value)}
                                            placeholder="http(s)://"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md input-focus dark:bg-gray-700 dark:text-white"
                                            disabled={isEditing}
                                        />
                                        {editError && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">{editError}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        disabled={isEditing}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        disabled={isEditing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isEditing ? (
                                            <>
                                                <LoadingSpinner color="text-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon />
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && deletingLink && (
                <>
                    <div
                        className="fixed inset-0 z-40 modal-backdrop animate-fade-in"
                        onClick={handleCloseDeleteModal}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform animate-scale-in border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Link</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        Are you sure you want to delete this link?
                                    </p>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Path</div>
                                        <div className="text-sm font-mono text-red-600 dark:text-red-400 break-all">{deletingLink.path}</div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseDeleteModal}
                                        disabled={deletingId === deletingLink.path}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        disabled={deletingId === deletingLink.path}
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-md button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {deletingId === deletingLink.path ? (
                                            <>
                                                <LoadingSpinner color="text-white" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <DeleteIcon />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}