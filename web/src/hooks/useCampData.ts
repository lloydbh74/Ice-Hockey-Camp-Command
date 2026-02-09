import { useState, useEffect } from "react";

interface Camp {
    id: number;
    name: string;
    year: number;
    status: string;
    purchase_count?: number;
}

interface CampProduct {
    id: number;
    product_id: number;
    product_name: string;
    price: number;
}

interface Product {
    id: number;
    name: string;
    base_price: number;
}

const ADMIN_TOKEN = 'swedish-camp-admin-2026';

export function useCampData(campId: string) {
    const [camp, setCamp] = useState<Camp | null>(null);
    const [campProducts, setCampProducts] = useState<CampProduct[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState({ remindersEnabled: true, reminderCadenceDays: 7, maxReminders: 3 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const headers = { 'X-Admin-Token': ADMIN_TOKEN };
            const [campData, cpRes, prodRes, settingsRes] = await Promise.all([
                fetch(`/api/admin/camps/${campId}`, { cache: 'no-store', headers }),
                fetch(`/api/admin/camps/${campId}/products`, { cache: 'no-store', headers }),
                fetch(`/api/admin/products`, { cache: 'no-store', headers }),
                fetch(`/api/admin/camps/${campId}/settings`, { cache: 'no-store', headers })
            ]);

            if (campData.ok) {
                setCamp(await campData.json());
            } else {
                setCamp(null);
            }

            const productsData = await cpRes.json();
            setCampProducts(Array.isArray(productsData) ? productsData : []);

            const allProductsData = await prodRes.json();
            setAllProducts(Array.isArray(allProductsData) ? allProductsData : []);

            const s: any = await settingsRes.json();
            if (!s.error) {
                setSettings({
                    remindersEnabled: s.reminders_enabled === 1,
                    reminderCadenceDays: s.reminder_cadence_days,
                    maxReminders: s.max_reminders
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [campId]);

    const saveSettings = async (newSettings: typeof settings) => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify(newSettings)
            });
            if (!res.ok) throw new Error("Failed to save settings");
            setSettings(newSettings);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const addProduct = async (productId: number, price: number) => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify({ productId, price })
            });

            if (!res.ok) {
                const err: any = await res.json();
                throw new Error(err.error || "Failed to add product");
            }

            await fetchData();
            return true;
        } catch (e: any) {
            throw e;
        }
    };

    const removeProduct = async (cpId: number) => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}/products?cpId=${cpId}`, {
                method: "DELETE",
                headers: { 'X-Admin-Token': ADMIN_TOKEN }
            });

            if (!res.ok) {
                const err: any = await res.json();
                throw new Error(err.error || "Failed to remove product");
            }

            await fetchData();
            return true;
        } catch (e: any) {
            throw e;
        }
    };

    const updateProduct = async (cpId: number, price: number) => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}/products`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify({ cpId, price })
            });

            if (!res.ok) {
                const err: any = await res.json();
                throw new Error(err.error || "Failed to update product");
            }

            await fetchData();
            return true;
        } catch (e: any) {
            throw e;
        }
    };

    const toggleStatus = async (newStatus: 'active' | 'deactivated') => {
        try {
            // Determine endpoint based on status. Deactivate is PATCH, activate is POST (as per our impl)
            const endpoint = newStatus === 'deactivated'
                ? `/api/admin/camps/${campId}/deactivate`
                : `/api/admin/camps/${campId}/deactivate`; // actually both are handled in that route file, let's verify.

            // Wait, I implemented PATCH for deactivate and POST for reactivate in the SAME file `api/admin/camps/[id]/deactivate/route.ts`

            const method = newStatus === 'deactivated' ? 'PATCH' : 'POST';

            const res = await fetch(`/api/admin/camps/${campId}/deactivate`, {
                method: method,
                headers: { 'X-Admin-Token': ADMIN_TOKEN }
            });

            if (!res.ok) {
                const data: any = await res.json();
                // Check if confirmation is required
                if (res.status === 409 && data.confirmationRequired) {
                    // We throw a specific error object that the UI can catch and show confirmation for
                    throw { confirmationRequired: true, message: data.message };
                }
                throw new Error(data.error || "Failed to update status");
            }

            await fetchData();
            return true;
        } catch (e: any) {
            throw e;
        }
    };

    const forceDeactivate = async () => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}/deactivate?force=true`, {
                method: 'PATCH',
                headers: { 'X-Admin-Token': ADMIN_TOKEN }
            });

            if (!res.ok) {
                const data: any = await res.json();
                throw new Error(data.error || "Failed to force deactivate");
            }

            await fetchData();
            return true;
        } catch (e: any) {
            throw e;
        }
    }

    const deleteCamp = async () => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}`, {
                method: "DELETE",
                headers: { 'X-Admin-Token': ADMIN_TOKEN }
            });

            if (!res.ok) {
                const data: any = await res.json();
                throw new Error(data.error || "Failed to delete camp");
            }

            return true;
        } catch (e: any) {
            throw e;
        }
    };

    const archiveCamp = async () => {
        try {
            const res = await fetch(`/api/admin/camps/${campId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    'X-Admin-Token': ADMIN_TOKEN
                },
                body: JSON.stringify({ status: 'archived' })
            });

            if (!res.ok) {
                const data: any = await res.json();
                throw new Error(data.error || "Failed to archive camp");
            }

            await fetchData();
            return true;
        } catch (e: any) {
            throw e;
        }
    };

    return {
        camp,
        campProducts,
        allProducts,
        settings,
        setSettings,
        loading,
        saveSettings,
        addProduct,
        updateProduct,
        removeProduct,
        toggleStatus,
        forceDeactivate,
        deleteCamp,
        archiveCamp,
        refresh: fetchData
    };
}
