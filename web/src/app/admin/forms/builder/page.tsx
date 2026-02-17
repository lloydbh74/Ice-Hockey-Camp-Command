"use client";

export const runtime = 'edge';


import { useState, useEffect, useRef } from "react";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SaveReleaseModal from "@/components/form/builder/SaveReleaseModal";
import { DraggableToolboxItem } from "@/components/form/builder/DraggableToolboxItem";
import { SortableCanvasItem } from "@/components/form/builder/SortableCanvasItem";
import PropertiesPanel from "@/components/form/builder/PropertiesPanel";

interface FormField {
    id: string;
    type: 'text' | 'select' | 'checkbox' | 'radio' | 'image_choice' | 'heading' | 'paragraph' | 'bullet' | 'divider' | 'separator';
    label: string;
    required: boolean;
    options?: string[];
    imageOptions?: { label: string; imageUrl: string }[];
    headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
}

import FormLibraryModal from "@/components/form/builder/FormLibraryModal";

export default function FormBuilderPage() {
    const [schema, setSchema] = useState<FormField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<any>(null); // For overlay
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // Undo/Redo State
    const [past, setPast] = useState<FormField[][]>([]);
    const [future, setFuture] = useState<FormField[][]>([]);

    // Form Metadata State
    const [currentFormId, setCurrentFormId] = useState<number>(1);
    const [formName, setFormName] = useState("New Form");
    const [currentVersion, setCurrentVersion] = useState("1.0.0");
    const [history, setHistory] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [showVersionHistory, setShowVersionHistory] = useState(false);

    useEffect(() => {
        loadForm(currentFormId);
    }, [currentFormId]);

    // Clear history on initial load or form switch
    useEffect(() => {
        setPast([]);
        setFuture([]);
    }, [currentFormId]);

    async function loadForm(id: number, silent = false) {
        if (!silent) setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/forms/${id}`, {
                cache: 'no-store',
                headers: { 'X-Admin-Token': 'swedish-camp-admin-2026' }
            });
            if (res.ok) {
                const data: any = await res.json();
                if (data.schema_json) {
                    try {
                        const parsed = JSON.parse(data.schema_json);
                        setSchema(Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        console.error("Failed to parse schema", e);
                    }
                }
                setFormName(data.name || "New Form");
                setCurrentVersion(data.version || "1.0.0");
                setHistory(data.history || []);
            } else {
                // If 404, might be a new form, reset state
                // Only reset if we are NOT in silent mode (which implies a reload after save)
                // Actually, if we just saved successfully, we expect it to exist. 
                // If it 404s after save, something is wrong, but better to keep current state than wipe it.
                if (!silent) {
                    setFormName("New Form");
                    setSchema([]);
                    setCurrentVersion("1.0.0");
                    setHistory([]);
                }
            }
        } catch (err) {
            console.error("Error fetching form:", err);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Wrapper for setting schema with history
    const updateSchema = (newSchema: FormField[] | ((prev: FormField[]) => FormField[])) => {
        setPast(prev => [...prev, schema]);
        setFuture([]);
        setSchema(newSchema);
    };

    const undo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setFuture(prev => [schema, ...prev]);
        setPast(prev => prev.slice(0, -1));
        setSchema(previous);
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setPast(prev => [...prev, schema]);
        setFuture(prev => prev.slice(1));
        setSchema(next);
    };

    const handleAddItem = (type: FormField['type']) => {
        const newItem: FormField = {
            id: crypto.randomUUID(),
            type,
            label: type === 'heading' ? 'Heading' :
                type === 'paragraph' ? '' :
                    type === 'bullet' ? 'Bullet point item' : 'New Question',
            required: false,
            headingLevel: type === 'heading' ? 'h2' : undefined,
            options: []
        };
        updateSchema((prev) => [...prev, newItem]);
        setSelectedFieldId(newItem.id);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragItem(active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        // Dropping a Toolbox Item onto Canvas
        if (active.data.current?.type === 'toolbox-item' && over.id === 'canvas-droppable') {
            const newItem: FormField = {
                id: crypto.randomUUID(),
                type: active.data.current.itemType,
                label: active.data.current.itemType === 'heading' ? 'Heading' :
                    active.data.current.itemType === 'paragraph' ? '' :
                        active.data.current.itemType === 'bullet' ? 'Bullet point item' : 'New Question',
                required: false,
                headingLevel: active.data.current.itemType === 'heading' ? 'h2' : undefined,
                options: []
            };
            updateSchema((prev) => [...prev, newItem]);
            setSelectedFieldId(newItem.id);
            return;
        }

        // Reordering Sortable Items
        if (active.id !== over.id) {
            updateSchema((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            return;
        }
    };

    const handleSave = async (data: { type: string; changelog: string }) => {
        // Optimistic update logic
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        let newVersion = currentVersion;
        if (data.type === 'patch') newVersion = `${major}.${minor}.${patch + 1}`;
        if (data.type === 'minor') newVersion = `${major}.${minor + 1}.0`;
        if (data.type === 'major') newVersion = `${major + 1}.0.0`;

        try {
            const res = await fetch(`/api/admin/forms/${currentFormId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Token': 'swedish-camp-admin-2026'
                },
                body: JSON.stringify({
                    schema,
                    version: newVersion,
                    changelog: data.changelog,
                    type: data.type,
                    name: formName // Saving the name
                })
            });

            if (res.ok) {
                setCurrentVersion(newVersion);
                setIsModalOpen(false);
                loadForm(currentFormId, true); // Silent refresh history
                alert("Form saved successfully!");
            } else {
                const errData: any = await res.json();
                console.error("Save failed:", res.status, errData);
                alert(`Failed to save form. Error: ${errData.error || res.statusText}`);
            }
        } catch (err) {
            console.error("Error saving form:", err);
            alert(`Error saving form: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleFieldUpdate = (updates: Partial<FormField>) => {
        if (!selectedFieldId) return;
        updateSchema(prev => prev.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f));
    };

    const handleFieldDelete = () => {
        if (!selectedFieldId) return;
        updateSchema(prev => prev.filter(f => f.id !== selectedFieldId));
        setSelectedFieldId(null);
    };

    const selectedField = schema.find(f => f.id === selectedFieldId) || null;

    const loadVersion = (historyItem: any) => {
        try {
            const parsed = JSON.parse(historyItem.schema_json);
            updateSchema(Array.isArray(parsed) ? parsed : []);
            setCurrentVersion(historyItem.version);
            setShowVersionHistory(false); // Close dropdown
        } catch (e) {
            console.error("Failed to parse historical schema", e);
            alert("Failed to load this version.");
        }
    };

    return (
        <DndContext id="form-builder-dnd" sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
                {/* TOP HEADER / ACTION BAR */}
                <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm" onClick={() => setShowVersionHistory(false)}>
                    {/* Left: Name & Version */}
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="text-lg font-semibold text-slate-800 dark:text-slate-100 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-blue-100 dark:focus:ring-primary/20 rounded px-2 py-1 transition-all outline-none"
                        />
                        <div className="relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowVersionHistory(!showVersionHistory)}
                                className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                <span>v{currentVersion}</span>
                                <span className="material-symbols-outlined text-[14px]">{showVersionHistory ? 'expand_less' : 'expand_more'}</span>
                            </button>

                            {/* Version History Dropdown */}
                            {showVersionHistory && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 max-h-[400px] overflow-y-auto">
                                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                        <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-400 uppercase tracking-wide">Version History</h3>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {/* Active Version */}
                                        <div className="flex items-start gap-2 text-xs p-2 bg-blue-50 dark:bg-primary/10 border border-blue-100 dark:border-primary/20 rounded-md">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 relative">
                                                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800 dark:text-slate-200">v{currentVersion} (Live)</div>
                                                <div className="text-slate-500 dark:text-slate-400 mt-0.5">Current Active Version</div>
                                            </div>
                                        </div>

                                        {history.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => loadVersion(item)}
                                                className="flex items-start gap-2 text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors group"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 mt-1 shrink-0 group-hover:bg-slate-400 dark:group-hover:bg-slate-500"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-700 dark:text-slate-300">v{item.version}</div>
                                                    <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap" title={item.changelog}>{item.changelog || "No changelog"}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{new Date(item.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}

                                        {history.length === 0 && (
                                            <div className="text-center text-[10px] text-slate-400 py-4">
                                                No previous versions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-4">
                            <button
                                onClick={undo}
                                disabled={past.length === 0}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Undo"
                            >
                                <span className="material-symbols-outlined text-[18px]">undo</span>
                            </button>
                            <button
                                onClick={redo}
                                disabled={future.length === 0}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Redo"
                            >
                                <span className="material-symbols-outlined text-[18px]">redo</span>
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setFormName("New Form");
                                setSchema([]);
                                setCurrentVersion("1.0.0");
                                setHistory([]);
                                setCurrentFormId(Date.now());
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Form
                        </button>

                        <button
                            onClick={() => setIsLibraryOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                            Library
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 shadow-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Save
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden relative" onClick={() => setShowVersionHistory(false)}>
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 z-50 flex items-center justify-center">
                            <div className="text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                                Loading form...
                            </div>
                        </div>
                    )}

                    {/* Left Sidebar: Toolbox */}
                    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 z-10 shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Toolbox</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Structure Section (Top Priority) */}
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Structure</h3>
                                <div className="space-y-2">
                                    <DraggableToolboxItem onClick={() => handleAddItem('heading')} type="heading" label="Heading" icon={<span className="material-symbols-outlined">title</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('paragraph')} type="paragraph" label="Paragraph" icon={<span className="material-symbols-outlined">notes</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('bullet')} type="bullet" label="Bullet Point" icon={<span className="material-symbols-outlined">format_list_bulleted</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('divider')} type="divider" label="Section Divider" icon={<span className="material-symbols-outlined">check_box_outline_blank</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('separator')} type="separator" label="Separator" icon={<span className="material-symbols-outlined">horizontal_rule</span>} />
                                </div>
                            </div>

                            {/* Input Fields Section */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Inputs</h3>
                                <div className="space-y-2">
                                    <DraggableToolboxItem onClick={() => handleAddItem('text')} type="text" label="Text Input" icon={<span className="material-symbols-outlined">short_text</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('checkbox')} type="checkbox" label="Checkbox" icon={<span className="material-symbols-outlined">check_box</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('radio')} type="radio" label="Radio Group" icon={<span className="material-symbols-outlined">radio_button_checked</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('select')} type="select" label="Dropdown" icon={<span className="material-symbols-outlined">arrow_drop_down_circle</span>} />
                                    <DraggableToolboxItem onClick={() => handleAddItem('image_choice')} type="image_choice" label="Image Choice" icon={<span className="material-symbols-outlined">image</span>} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Canvas */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-8 overflow-y-auto" onClick={() => setSelectedFieldId(null)}>
                        <SortableContext items={schema} strategy={verticalListSortingStrategy}>
                            <div onClick={(e) => e.stopPropagation()}>
                                <CanvasDroppable id="canvas-droppable" items={schema} selectedId={selectedFieldId} onSelect={setSelectedFieldId} setSchema={setSchema} />
                            </div>
                        </SortableContext>
                    </div>

                    {/* Right Sidebar: Properties & History */}
                    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10">
                        <div className="flex-1 overflow-hidden">
                            <PropertiesPanel
                                field={selectedField}
                                onChange={handleFieldUpdate}
                                onDelete={handleFieldDelete}
                            />
                        </div>
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {
                        activeDragItem?.type === 'toolbox-item' ? (
                            <div className="p-3 bg-white border border-primary shadow-lg rounded-lg w-48 opacity-90 cursor-grabbing">
                                {activeDragItem.itemType}
                            </div>
                        ) : null
                    }
                </DragOverlay >

                {/* Modals */}
                <SaveReleaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    currentVersion={currentVersion}
                />
                <FormLibraryModal
                    isOpen={isLibraryOpen}
                    onClose={() => setIsLibraryOpen(false)}
                    onSelect={(id) => {
                        setCurrentFormId(id);
                        setIsLibraryOpen(false);
                    }}
                />
            </div>
        </DndContext >
    );
}

// Helper for Droppable Area
import { useDroppable } from "@dnd-kit/core";

function CanvasDroppable({ id, items, selectedId, onSelect, setSchema }: any) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`max-w-3xl mx-auto bg-white dark:bg-slate-900 min-h-[800px] shadow-sm rounded-lg p-8 border transition-colors ${isOver ? 'border-primary bg-blue-50/10 dark:bg-primary/5' : 'border-slate-200 dark:border-slate-800'}`}
        >
            {items.length === 0 ? (
                <div className="text-center text-slate-400 dark:text-slate-600 py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
                    Drag fields here
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((field: FormField) => (
                        <SortableCanvasItem
                            key={field.id}
                            id={field.id}
                            field={field}
                            isSelected={field.id === selectedId}
                            onSelect={() => onSelect(field.id)}
                            onDelete={() => setSchema((prev: FormField[]) => prev.filter((f) => f.id !== field.id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
