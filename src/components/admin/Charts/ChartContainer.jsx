export default function ChartContainer({ title, children }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            <div className="h-80">{children}</div>
        </div>
    );
}