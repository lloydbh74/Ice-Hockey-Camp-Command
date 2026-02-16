
export const runtime = 'edge';

export default function DebugLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body>
                <div style={{ border: '5px solid red' }}>
                    {children}
                </div>
            </body>
        </html>
    );
}
