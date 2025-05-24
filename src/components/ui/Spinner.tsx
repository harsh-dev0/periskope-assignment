import React from "react";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "green";
  className?: string;
};

export default function Spinner({
  size = "md",
  variant = "default",
  className = "",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    default: "border-gray-300 border-t-gray-600",
    green: "border-green-100 border-t-green-500",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} border-4 rounded-full animate-spin ${className}`}
    ></div>
  );
} 