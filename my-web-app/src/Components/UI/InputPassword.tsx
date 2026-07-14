import React, { useState } from "react";

interface InputPasswordProps {
    label: string;
    nama: string;
    register: any;
    error?: string;
}

const InputPassword: React.FC<InputPasswordProps> = ({
    label,
    nama,
    register,
    error,
}) => {
    const [show, setShow] = useState<boolean>(false);

    return (
        <div className="flex flex-col gap-1 mb-4">
            {/* Label */}
            <label
                htmlFor={nama}
                className="text-sm font-medium text-gray-700"
            >
                {label}
            </label>

            {/* Input + Toggle */}
            <div className="relative">
                <input
                    id={nama}
                    type={show ? "text" : "password"}
                    {...register(nama)}
                    placeholder={`Masukkan ${label.toLowerCase()}`}
                    className={`
                        border w-full px-3 py-3 pr-16 rounded-2xl text-sm outline-none transition-all
                        bg-white
                        hover:border-gray-400
                        focus:ring-2
                        ${error
                            ? "border-red-500 bg-red-50 focus:ring-red-100"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                        }
                    `}
                />

                {/* Toggle Button */}
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-blue-500 transition-colors font-medium"
                >
                    {show ? "Hide" : "Show"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default InputPassword;