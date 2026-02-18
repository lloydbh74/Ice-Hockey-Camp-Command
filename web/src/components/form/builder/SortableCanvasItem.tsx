"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ReactMarkdown from 'react-markdown';

interface SortableCanvasItemProps {
    id: string;
    field: any;
    isSelected?: boolean;
    onSelect?: () => void;
    onDelete?: () => void;
}

export function SortableCanvasItem({ id, field, isSelected, onSelect, onDelete }: SortableCanvasItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onSelect}
            className={`group relative p-4 bg-white dark:bg-slate-900 border rounded-lg mb-3 shadow-sm transition-all
        ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
      `}
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400">
                <span className="material-symbols-outlined">drag_indicator</span>
            </div>

            <div className="ml-8 pr-8">
                {/* Structural Components */}
                {['heading', 'paragraph', 'bullet', 'divider', 'separator', 'image'].includes(field.type) ? (
                    <div className="pointer-events-none">
                        {field.type === 'image' && (
                            <div className="my-4">
                                {field.imageUrl ? (
                                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                        <img src={field.imageUrl} alt={field.imageAlt || 'Reference Image'} className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                                    </div>
                                ) : (
                                    <div className="aspect-[16/9] rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                        <span className="material-symbols-outlined text-4xl mb-2">image</span>
                                        <p className="text-sm font-medium">Static Image</p>
                                        <p className="text-[10px] opacity-60">Add URL in properties</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {field.type === 'heading' && (
                            <div className={`font-bold text-slate-800 dark:text-slate-100 ${field.headingLevel === 'h1' ? 'text-4xl' :
                                field.headingLevel === 'h3' ? 'text-xl' :
                                    field.headingLevel === 'h4' ? 'text-lg' : 'text-2xl' // Default H2
                                }`}>
                                <ReactMarkdown components={{
                                    a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
                                }}>
                                    {field.label || 'Heading'}
                                </ReactMarkdown>
                            </div>
                        )}
                        {field.type === 'paragraph' && (
                            <div className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                                {field.label ? (
                                    <ReactMarkdown components={{
                                        a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
                                    }}>
                                        {field.label}
                                    </ReactMarkdown>
                                ) : (
                                    <span className="text-slate-400 italic">Enter text here...</span>
                                )}
                            </div>
                        )}
                        {field.type === 'bullet' && (
                            <div className="flex items-start gap-2">
                                <span className="text-slate-800 dark:text-slate-200 mt-1.5">•</span>
                                <div className="text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown components={{
                                        a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
                                    }}>
                                        {field.label || 'Bullet point item'}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                        {field.type === 'divider' && (
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Section Divider
                            </div>
                        )}
                        {field.type === 'separator' && (
                            <hr className="border-slate-300 dark:border-slate-700 my-4" />
                        )}
                    </div>
                ) : (
                    <>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 pointer-events-none">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {/* Input Fields */}
                        <div className="pointer-events-none">
                            {field.type === 'text' && (
                                <input type="text" disabled className="w-full border border-slate-400 dark:border-slate-700 rounded px-3 py-2 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500" placeholder="Text answer" />
                            )}
                            {field.type === 'date' && (
                                <input type="date" disabled className="w-full border border-slate-400 dark:border-slate-700 rounded px-3 py-2 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-100" />
                            )}
                            {field.type === 'checkbox' && (
                                <div className="space-y-2">
                                    {(field.options && field.options.length > 0 ? field.options : ['Option 1', 'Option 2']).map((opt: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input type="checkbox" disabled className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {field.type === 'radio' && (
                                <div className="space-y-2">
                                    {(field.options && field.options.length > 0 ? field.options : ['Option 1', 'Option 2']).map((opt: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input type="radio" disabled className="border-slate-300 dark:border-slate-700 dark:bg-slate-800" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {field.type === 'select' && (
                                <select disabled className="w-full border border-slate-300 dark:border-slate-700 rounded px-3 py-2 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-300">
                                    {(field.options && field.options.length > 0 ? field.options : ['Select an option']).map((opt: string, idx: number) => (
                                        <option key={idx}>{opt}</option>
                                    ))}
                                </select>
                            )}
                            {field.type === 'image_choice' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(field.imageOptions && field.imageOptions.length > 0
                                        ? field.imageOptions
                                        : [
                                            { label: 'Option 1', imageUrl: '' },
                                            { label: 'Option 2', imageUrl: '' },
                                            { label: 'Option 3', imageUrl: '' }
                                        ]
                                    ).map((opt: any, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-1.5">
                                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                                {opt.imageUrl ? (
                                                    <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">image</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-center font-medium text-slate-500 dark:text-slate-400 truncate px-1">
                                                {opt.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Actions */}
            {isSelected && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            )}
        </div>
    );
}
