import { useState, useRef } from "react";
import LinkInsertionModal from "./LinkInsertionModal";


interface FormField {
    id: string;
    type: 'text' | 'select' | 'checkbox' | 'radio' | 'image_choice' | 'date' | 'image' | 'heading' | 'paragraph' | 'bullet' | 'divider' | 'separator';
    label: string;
    required: boolean;
    options?: string[];
    imageOptions?: { label: string; imageUrl: string }[];
    headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
    imageUrl?: string;
    imageAlt?: string;
    isHighlighted?: boolean;
}

interface PropertiesPanelProps {
    field: FormField | null;
    onChange: (updates: Partial<FormField>) => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

export default function PropertiesPanel({ field, onChange, onDelete, onDuplicate }: PropertiesPanelProps) {
    // Link Insertion Logic - Hooks must be at top level
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [selectedTextRange, setSelectedTextRange] = useState<{ start: number; end: number } | null>(null);
    const [currentLinkData, setCurrentLinkData] = useState<{ type: 'url' | 'phone' | 'email'; value: string } | null>(null);
    const activeTextareaRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(null);

    if (!field) {
        return (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 mt-10">
                <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
                <p>Select an element on the canvas to edit its properties.</p>
            </div>
        );
    }

    const handleAddOption = () => {
        const currentOptions = field.options || [];
        onChange({ options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
    };

    const handleUpdateOption = (index: number, value: string) => {
        const currentOptions = field.options || [];
        const newOptions = [...currentOptions];
        newOptions[index] = value;
        onChange({ options: newOptions });
    };

    const handleDeleteOption = (index: number) => {
        const currentOptions = field.options || [];
        onChange({ options: currentOptions.filter((_, i) => i !== index) });
    };

    const handleAddImageOption = () => {
        const currentOptions = field.imageOptions || [];
        onChange({ imageOptions: [...currentOptions, { label: `Option ${currentOptions.length + 1}`, imageUrl: "" }] });
    };

    const handleUpdateImageOption = (index: number, updates: Partial<{ label: string; imageUrl: string }>) => {
        const currentOptions = field.imageOptions || [];
        const newOptions = [...currentOptions];
        newOptions[index] = { ...newOptions[index], ...updates };
        onChange({ imageOptions: newOptions });
    };

    const handleDeleteImageOption = (index: number) => {
        const currentOptions = field.imageOptions || [];
        onChange({ imageOptions: currentOptions.filter((_, i) => i !== index) });
    };

    const handleImageUpload = (index: number) => {
        setCurrentUploadIndex(index);
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || currentUploadIndex === null) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                headers: { "X-Admin-Token": "swedish-camp-admin-2026" },
                body: formData
            });

            if (res.ok) {
                const data: any = await res.json();
                handleUpdateImageOption(currentUploadIndex, { imageUrl: data.url });
            } else {
                alert("Upload failed");
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload error");
        } finally {
            setCurrentUploadIndex(null);
            e.target.value = ""; // Reset
        }
    };

    const handleLinkClick = () => {
        if (!activeTextareaRef.current) return;

        const el = activeTextareaRef.current;
        const start = el.selectionStart;
        const end = el.selectionEnd;

        // Validation for null selection indices (some inputs don't support it)
        if (start === null || end === null) return;

        setSelectedTextRange({ start, end });
        setCurrentLinkData(null);
        setLinkModalOpen(true);
    };

    const handleApplyLink = (data: { type: 'url' | 'phone' | 'email'; value: string }) => {
        if (!activeTextareaRef.current || !selectedTextRange) return;

        const el = activeTextareaRef.current;
        const { start, end } = selectedTextRange;
        const selectedText = el.value.substring(start, end) || 'link';

        let href = data.value;
        if (data.type === 'email' && !href.startsWith('mailto:')) href = `mailto:${href}`;
        if (data.type === 'phone' && !href.startsWith('tel:')) href = `tel:${href}`;

        const markdownLink = `[${selectedText}](${href})`;

        el.setRangeText(markdownLink, start, end, 'select');

        // Trigger generic change to update parent state
        onChange({ label: el.value });
        setLinkModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
            />
            <LinkInsertionModal
                key={linkModalOpen ? 'open' : 'closed'}
                isOpen={linkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                onSave={handleApplyLink}
                onRemove={() => { }}
                initialData={currentLinkData}
            />
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Properties</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Editing:</span>
                    <span className="text-sm font-semibold text-primary capitalize">{field.type.replace('_', ' ')}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Reference ID (mostly for debug) */}
                <div className="hidden">
                    <span className="text-xs font-mono text-slate-400">#{field.id.split('-')[0]}</span>
                </div>

                {/* Content/Label Section */}
                {!['divider', 'separator'].includes(field.type) && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="field-content-input" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                {['heading', 'paragraph', 'bullet'].includes(field.type) ? 'Content' : 'Label'}
                            </label>
                        </div>

                        <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-shadow">
                            {/* Rich Text Toolbar - Only for structural text types */}
                            {['heading', 'paragraph', 'bullet'].includes(field.type) && (
                                <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_underlined</span></button>
                                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                    <button
                                        onClick={handleLinkClick}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                                        title="Insert Link"
                                    >
                                        <span className="material-symbols-outlined text-lg">link</span>
                                    </button>
                                </div>
                            )}

                            {['heading', 'bullet'].includes(field.type) ? (
                                <input
                                    id="field-content-input"
                                    ref={activeTextareaRef as React.Ref<HTMLInputElement>}
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => onChange({ label: e.target.value })}
                                    className="w-full p-3 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none text-base"
                                    placeholder={field.type === 'heading' ? 'Heading Text' : 'Bullet Point Text'}
                                />
                            ) : (
                                <textarea
                                    id="field-content-input"
                                    ref={activeTextareaRef as any}
                                    value={field.label}
                                    onChange={(e) => onChange({ label: e.target.value })}
                                    className="w-full p-3 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 min-h-[100px] resize-none outline-none text-base"
                                    placeholder={field.type === 'paragraph' ? "Enter text here..." : "Enter your question here..."}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Heading Level - Only for Headings */}
                {field.type === 'heading' && (
                    <div className="space-y-3">
                        <label htmlFor="heading-level-select" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Heading Level</label>
                        <select
                            id="heading-level-select"
                            value={field.headingLevel || 'h2'}
                            onChange={(e) => onChange({ headingLevel: e.target.value as any })}
                            className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="h1">H1 - Page Title</option>
                            <option value="h2">H2 - Section</option>
                            <option value="h3">H3 - Subsection</option>
                            <option value="h4">H4 - Small</option>
                        </select>
                    </div>
                )}

                {/* Static Image Settings */}
                {field.type === 'image' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Image URL</label>
                            <input
                                type="text"
                                value={field.imageUrl || ""}
                                onChange={(e) => onChange({ imageUrl: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Accessibility Alt Text</label>
                            <input
                                type="text"
                                value={field.imageAlt || ""}
                                onChange={(e) => onChange({ imageAlt: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100"
                                placeholder="e.g. Jersey size chart"
                            />
                        </div>
                    </div>
                )}

                {/* Required & Highlight Toggles */}
                {!['heading', 'paragraph', 'bullet', 'divider', 'separator', 'image'].includes(field.type) && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="required_toggle"
                                checked={field.required}
                                onChange={(e) => onChange({ required: e.target.checked })}
                                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="required_toggle" className="text-sm font-medium text-slate-900 dark:text-slate-200 cursor-pointer">Required Field</label>
                        </div>
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="highlight_toggle"
                                checked={!!field.isHighlighted}
                                onChange={(e) => onChange({ isHighlighted: e.target.checked })}
                                className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer mt-0.5"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="highlight_toggle" className="text-sm font-medium text-slate-900 dark:text-slate-200 cursor-pointer line-clamp-1">Show in Attendee Lists</label>
                                <span className="text-[10px] text-slate-500 max-w-xs">Highlights this answer in red on the admin attendance and registration pages (Max 5 per form).</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Options Editor */}
                {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Options</label>
                            <button
                                onClick={handleAddOption}
                                className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Option
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(field.options || []).map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded flex items-center bg-white dark:bg-slate-900 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleUpdateOption(idx, e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-300"
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleDeleteOption(idx)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete option"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ))}
                            {(!field.options || field.options.length === 0) && (
                                <div className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-200 rounded text-center">
                                    No options added yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Image Options Editor */}
                {field.type === 'image_choice' && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Image Choices</label>
                            <button
                                onClick={handleAddImageOption}
                                className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Choice
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(field.imageOptions || []).map((opt, idx) => (
                                <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3 bg-slate-50/50 dark:bg-slate-900/50 group relative">
                                    <button
                                        onClick={() => handleDeleteImageOption(idx)}
                                        className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Delete option"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Label</label>
                                        <input
                                            type="text"
                                            value={opt.label}
                                            onChange={(e) => handleUpdateImageOption(idx, { label: e.target.value })}
                                            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                                            placeholder="Option label"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image</label>
                                        <div className="flex gap-2">
                                            <div
                                                onClick={() => handleImageUpload(idx)}
                                                className="w-12 h-12 rounded border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden shrink-0"
                                            >
                                                {opt.imageUrl ? (
                                                    <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-300 text-lg">add_a_photo</span>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={opt.imageUrl}
                                                onChange={(e) => handleUpdateImageOption(idx, { imageUrl: e.target.value })}
                                                className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-xs outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Image URL (or upload)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!field.imageOptions || field.imageOptions.length === 0) && (
                                <div className="text-sm text-slate-500 italic p-4 border border-dashed border-slate-200 rounded text-center">
                                    No image choices added yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900 grid grid-cols-2 gap-3">
                {onDuplicate && (
                    <button
                        onClick={onDuplicate}
                        className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        title="Duplicate Component"
                    >
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                        Duplicate
                    </button>
                )}
                <button
                    onClick={onDelete}
                    className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                    title="Delete Component"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Delete
                </button>
            </div>
        </div>
    );
}
