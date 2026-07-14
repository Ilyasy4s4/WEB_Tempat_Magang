interface ButtonProps {
  label: string;
  variant?: "primary" | "outline";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  className,
  type = "button",
}) => {
  const baseStyle =
    "px-10 py-3 rounded font-medium transition-all duration-200";
  const variantStyle =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-blue-600 text-blue-600 hover:bg-blue-50";
  return (
    <button type={type} className={`${baseStyle} ${variantStyle} ${className}`}>
      {label}
    </button>
  );
};

export default Button;
