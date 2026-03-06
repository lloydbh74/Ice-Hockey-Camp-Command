"use client";

import { useState } from "react";
import { UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ParsedRecord {
    orderId: string;
    orderStatus: string;
    orderNumber: string;
    orderDate: string;
    guardianName: string;
    guardianEmail: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    campId: number;
    productId: number;
    systemProductName: string;
    isProblemOrder: boolean;
    isRefunded?: boolean;
    hasConflict?: boolean;
    potentialMatch?: {
        purchaseId: number;
        dbEmail: string;
    } | null;
}

interface ManualRegistration {
    id: number;
    guardianName: string;
    guardianEmail: string;
    productName: string;
    campId: number;
    campName: string;
    registrationState: string;
    purchaseTimestamp: string;
    rawEmailId: string;
    isManual: boolean;
}

interface ParseResponse {
    success: boolean;
    summary: {
        totalParsed: number;
        existingMatchCount: number;
        missingCount: number;
        skippedCount: number;
        manualCount: number;
    };
    data: {
        missing: ParsedRecord[];
        existing: (ParsedRecord & { purchaseId: number, registrationState: string })[];
        skipped: (ParsedRecord & { skipReason: string })[];
        manualOnly: ManualRegistration[];
    };
}

export default function ReconciliationPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<ParseResponse | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setParsedData(null);
            setSelectedRecords(new Set());
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/reconciliation/parse", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorResponse = await res.json() as { error?: string };
                throw new Error(errorResponse.error || "Failed to parse CSV");
            }

            const data = await res.json() as ParseResponse;
            setParsedData(data);

            // Auto-select all missing records by default
            if (data?.data?.missing) {
                const allMissingIds = new Set(data.data.missing.map(r => r.orderId));
                setSelectedRecords(allMissingIds);
            }

            toast.success("CSV Parsed", {
                description: `Found ${data.summary.missingCount} discrepancies needing import.`,
            });
        } catch (error: any) {
            toast.error("Error Parsing", {
                description: error.message,
            });
        } finally {
            setIsParsing(false);
        }
    };

    const toggleRecordSelection = (orderId: string) => {
        const newSelection = new Set(selectedRecords);
        if (newSelection.has(orderId)) {
            newSelection.delete(orderId);
        } else {
            newSelection.add(orderId);
        }
        setSelectedRecords(newSelection);
    };

    const toggleAllRecords = () => {
        if (!parsedData) return;
        if (selectedRecords.size === parsedData.data.missing.length) {
            setSelectedRecords(new Set());
        } else {
            setSelectedRecords(new Set(parsedData.data.missing.map(r => r.orderId)));
        }
    };

    const handleProcess = async () => {
        if (!parsedData || selectedRecords.size === 0) return;

        setIsProcessing(true);
        const recordsToProcess = parsedData.data.missing.filter(r => selectedRecords.has(r.orderId));

        try {
            const res = await fetch("/api/admin/reconciliation/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ records: recordsToProcess }),
            });

            if (!res.ok) {
                const errorResponse = await res.json() as { error?: string };
                throw new Error(errorResponse.error || "Failed to process records");
            }

            const data = await res.json() as { summary: { successCount: number } };

            toast.success("Import Complete", {
                description: `Successfully imported ${data.summary.successCount} records. Sent welcome emails.`,
            });

            // Clear the parsed data so they have to re-upload to double check
            setParsedData(null);
            setFile(null);
            setSelectedRecords(new Set());

        } catch (error: any) {
            toast.error("Process Error", {
                description: error.message,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Sales Data Reconciliation</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Upload a shop export CSV to find and import missing registrations.
                </p>
            </div>

            {!parsedData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Shop CSV</CardTitle>
                        <CardDescription>
                            Upload the orders export CSV from the shop to begin reconciliation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 bg-muted/20">
                            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                            <div className="flex flex-col items-center gap-2">
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors"
                                >
                                    Select CSV File
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".csv"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                                {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={!file || isParsing}
                                className="mt-6 w-full max-w-sm"
                            >
                                {isParsing ? "Analyzing..." : "Analyze File"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {parsedData && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-5">
                        <Card className="border-t-4 border-t-slate-400 shadow-sm">
                            <CardHeader className="py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Rows</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{parsedData.summary.totalParsed}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-t-4 border-t-green-500 shadow-sm">
                            <CardHeader className="py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-green-600">Matches</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{parsedData.summary.existingMatchCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-t-4 border-t-amber-500 shadow-sm">
                            <CardHeader className="py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600">Missing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-amber-600">{parsedData.summary.missingCount}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-t-4 border-t-blue-500 shadow-sm">
                            <CardHeader className="py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">BACS/Manual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">{parsedData.summary.manualCount}</div>
                            </CardContent>
                        </Card>
                        <Card className={`shadow-sm ${parsedData.summary.skippedCount > 0 ? "border-t-4 border-t-red-500 bg-red-50/30" : "border-t-4 border-t-slate-200"}`}>
                            <CardHeader className="py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Skipped</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${parsedData.summary.skippedCount > 0 ? "text-red-600" : "text-slate-400"}`}>
                                    {parsedData.summary.skippedCount}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {parsedData.data.existing.some(r => r.hasConflict) && (
                        <Alert variant="destructive" className="border-red-600 bg-red-50 text-red-900">
                            <AlertCircle className="h-5 w-5" />
                            <AlertTitle className="font-bold">Urgent: Shop Refunds / Conflicts Detected</AlertTitle>
                            <AlertDescription>
                                The following orders are marked as **REFUNDED** or **PROBLEM** in the shop, but are still **ACTIVE** in our database.
                                Please review these manually to ensure they are deactivated if necessary.
                            </AlertDescription>
                            <div className="mt-4 space-y-2">
                                {parsedData.data.existing.filter(r => r.hasConflict).map(r => (
                                    <div key={r.orderId} className="text-sm flex items-center justify-between p-2 bg-white rounded border border-red-200">
                                        <span><strong>#{r.orderNumber}</strong>: {r.guardianName} ({r.guardianEmail})</span>
                                        <Badge variant="destructive">Shop: {r.orderStatus} | DB: {r.registrationState}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Alert>
                    )}

                    {parsedData.data.missing.length > 0 && (
                        <Card className="border-amber-200">
                            <CardHeader className="bg-amber-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-amber-800 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Missing Registrations
                                        </CardTitle>
                                        <CardDescription className="text-amber-700 mt-1">
                                            These orders exist in the shop but not in the camp database.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={handleProcess}
                                        disabled={selectedRecords.size === 0 || isProcessing}
                                    >
                                        {isProcessing ? "Importing & Emailing..." : `Import Selected (${selectedRecords.size})`}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 border-y border-amber-100 text-amber-900 text-xs uppercase font-bold tracking-tight">
                                            <tr>
                                                <th className="px-6 py-4 w-[60px] text-center">
                                                    <Checkbox
                                                        checked={selectedRecords.size === parsedData.data.missing.length && parsedData.data.missing.length > 0}
                                                        onCheckedChange={toggleAllRecords}
                                                        aria-label="Select all missing registrations"
                                                    />
                                                </th>
                                                <th className="px-6 py-4">Order</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Purchaser</th>
                                                <th className="px-6 py-4">Product (Camp)</th>
                                                <th className="px-6 py-4">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.data.missing.map((record) => (
                                                <tr key={record.orderId} className={`border-b ${record.isProblemOrder ? 'bg-red-50/50' : 'hover:bg-muted/50'}`}>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
                                                            <Checkbox
                                                                checked={selectedRecords.has(record.orderId)}
                                                                onCheckedChange={() => toggleRecordSelection(record.orderId)}
                                                                aria-label={`Select order ${record.orderNumber} for import`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                        <div>#{record.orderNumber}</div>
                                                        {record.potentialMatch && (
                                                            <Badge variant="outline" className="mt-1 text-[10px] border-amber-300 bg-amber-50 text-amber-700">
                                                                Identity Match
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {record.isProblemOrder ? (
                                                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                                <AlertCircle className="h-3 w-3" />
                                                                {record.isRefunded ? 'REFUNDED' : 'PROBLEM'}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-slate-300">{record.orderStatus}</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold">{record.guardianName}</div>
                                                        <div className="text-muted-foreground text-xs">{record.guardianEmail}</div>
                                                        {record.potentialMatch && (
                                                            <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                                                                * DB email: {record.potentialMatch.dbEmail}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-700">{record.systemProductName}</div>
                                                        <div className="text-muted-foreground text-xs">SKU: {record.productSku}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                                        {new Date(record.orderDate).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {parsedData.data.skipped.length > 0 && (
                        <Card className="border-red-200">
                            <CardHeader className="bg-red-50">
                                <CardTitle className="text-red-800 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Skipped Records (Action Required)
                                </CardTitle>
                                <CardDescription className="text-red-700">
                                    These rows could not be processed. Please resolve the issues below and re-upload the file.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3">Order</th>
                                                <th className="px-4 py-3">Purchaser</th>
                                                <th className="px-4 py-3">CSV Product / SKU</th>
                                                <th className="px-4 py-3">Reason for Skip</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.data.skipped.map((record, idx) => (
                                                <tr key={`${record.orderId}-${idx}`} className="border-b hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">#{record.orderNumber}</td>
                                                    <td className="px-4 py-3">
                                                        <div>{record.guardianName}</div>
                                                        <div className="text-xs text-muted-foreground">{record.guardianEmail}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>{record.productName}</div>
                                                        <div className="text-mono text-[10px] bg-slate-100 px-1 rounded w-fit">{record.productSku}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="destructive" className="font-normal">
                                                            {record.skipReason}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {parsedData.summary.missingCount === 0 && parsedData.summary.skippedCount === 0 ? (
                        <Alert className="bg-green-50 text-green-800 border-green-200">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <AlertTitle>All Good!</AlertTitle>
                            <AlertDescription>
                                No discrepancies or skipped records found. All valid shop orders are already in the database.
                            </AlertDescription>
                        </Alert>
                    ) : (parsedData.summary.missingCount === 0 && (
                        <Alert className="bg-slate-50 text-slate-600 border-slate-200">
                            <AlertCircle className="h-5 w-5 text-slate-400" />
                            <AlertTitle>No New Discrepancies</AlertTitle>
                            <AlertDescription>
                                No records are missing from the database, but some rows were skipped (see below).
                            </AlertDescription>
                        </Alert>
                    ))}

                    {parsedData.data.manualOnly.length > 0 && (
                        <Card className="border-blue-200">
                            <CardHeader className="bg-blue-50">
                                <CardTitle className="text-blue-800 flex items-center gap-2 text-lg">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Manual / BACS Registrations
                                </CardTitle>
                                <CardDescription className="text-blue-700">
                                    These participants are in the database but do not appear in this shop export (likely manual or BACS).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-blue-50/50 border-y border-blue-100 text-blue-900 text-xs uppercase font-bold tracking-tight">
                                            <tr>
                                                <th className="px-6 py-4">Participant</th>
                                                <th className="px-6 py-4">Camp / Product</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Source</th>
                                                <th className="px-6 py-4">Date Added</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.data.manualOnly.map((reg) => (
                                                <tr key={reg.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold">{reg.guardianName}</div>
                                                        <div className="text-xs text-muted-foreground">{reg.guardianEmail}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-700">{reg.campName}</div>
                                                        <div className="text-xs text-muted-foreground">{reg.productName}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="secondary" className="px-2 py-0.5 text-[11px] uppercase tracking-wider">{reg.registrationState}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="bg-white border-slate-200 font-medium font-mono text-[10px]">
                                                            {reg.isManual ? 'MANUAL / BACS' : 'OLD IMPORT'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                                        {new Date(reg.purchaseTimestamp).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={() => { setParsedData(null); setFile(null); }}>
                            Start Over
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
