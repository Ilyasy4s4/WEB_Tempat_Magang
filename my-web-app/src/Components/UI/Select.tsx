import { useEffect, useState } from "react";

interface Option {
    id: string | number;
    label: string;
}

interface InputSelectEventProps {
    label: string;
    nama: string;
    register: any;
    setValue: any;
    error?: string;
    endpoint: string;
    value?: string;
    placeholder?: string;
}

const InputSelectEvent: React.FC<InputSelectEventProps> = ({
    label,
    nama,
    register,
    setValue,
    error,
    endpoint,
    value,
    placeholder = "-- Pilih Opsi --",
}) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchOptions = async () => {
            setLoading(true);
            setFetchError(null);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`);

                if (!response.ok) {
                    throw new Error("Gagal mengambil data");
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Format data tidak valid");
                }

                const normalizedOptions = data
                    .map((item: any) => ({
                        id: item.id,
                        label: typeof item.name === "string" ? item.name : item.role,
                    }))
                    .filter((item: Option) => Boolean(item.id) && Boolean(item.label));

                if (isMounted) {
                    setOptions(normalizedOptions);
                }
            } catch {
                if (isMounted) {
                    setFetchError(`Gagal memuat ${label.toLowerCase()}`);
                    setOptions([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOptions();

        return () => {
            isMounted = false;
        };
    }, [endpoint, label]);

    const selectedOption = options.find((option) => String(option.id) === String(value ?? ""));

    const handleSelect = (option: Option) => {
        setValue(nama, String(option.id));
        setOpen(false);
    };

    return (
        <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm font-medium text-gray-700">{label}</label>

            <input type="hidden" {...register(nama)} />

            <button
                type="button"
                onClick={() => setOpen(!open)}
                disabled={loading}
                className={`border px-3 py-2.5 rounded-2xl bg-white text-left flex justify-between items-center text-sm transition-all
            hover:border-gray-400
            ${open ? "border-blue-500 ring-2 ring-blue-100" : ""}
            ${(fetchError || error) ? "border-red-400 bg-red-50" : "border-gray-200"}
        `}
            >
                <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
                    {loading ? "Memuat..." : selectedOption ? selectedOption.label : fetchError ? fetchError : placeholder}
                </span>
                <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
            </button>

            {open && !loading && !fetchError && (
                <div className="border border-gray-200 rounded-2xl bg-white shadow-lg overflow-hidden z-10">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors
                        hover:bg-blue-50 hover:text-blue-600
                        ${selectedOption?.id === option.id ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"}
                    `}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="text-red-600 text-xs mt-0.5">{error}</p>}
        </div>
    );
};

export default InputSelectEvent;