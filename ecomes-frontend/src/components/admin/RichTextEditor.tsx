"use client";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Enter description...",
    label = "Description",
}: RichTextEditorProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="bg-white rounded-lg border border-gray-300">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
            </div>
            <p className="text-xs text-gray-500">
                You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;)
            </p>
        </div>
    );
}
