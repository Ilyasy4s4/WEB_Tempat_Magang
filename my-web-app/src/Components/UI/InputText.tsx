import React from "react";

interface InputTextProps {
    label: string;
    nama: string;
    register: any;
    error?: string;
}

const InputText: React.FC<InputTextProps> = ({
    label,
    nama,
    register,
    error,
}) => {
    return (
        <div className="flex flex-col gap-1 mb-4">
            {/* Label */}
            <label 
                htmlFor={nama} 
                className="text-sm font-medium text-gray-700"
            >
                {label}
            </label>

            {/* Input */}
            <input
                id={nama}
                type="text"
                {...register(nama)}
                placeholder={`Masukkan ${label.toLowerCase()}`}
                className={`
                    border p-3 rounded-2xl text-sm outline-none transition-all
                    bg-white
                    hover:border-gray-400
                    focus:ring-2 focus:ring-blue-100
                    ${error 
                        ? "border-red-500 bg-red-50 focus:ring-red-100" 
                        : "border-gray-300 focus:border-blue-500"
                    }
                `}
            />

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default InputText;