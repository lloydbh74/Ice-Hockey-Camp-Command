import React from "react";
import ManualLayout from "./ManualLayout";

export default function AdminManualLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ManualLayout>
            {children}
        </ManualLayout>
    );
}
