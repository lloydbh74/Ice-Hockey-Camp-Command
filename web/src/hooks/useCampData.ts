import { useState, useEffect } from "react";

interface Camp {
    id: number;
    name: string;
    year: number;
    status: string;
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

    return {
        camp,
        campProducts,
        allProducts,
        settings,
        setSettings,
        loading,
        saveSettings,
        addProduct,
        removeProduct,
        refresh: fetchData
    };
}
