import React from 'react';
import { cn } from '@/lib/utils';

const UserButton = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-red-600 text-white hover:bg-red-700 border border-red-500 hover:border-red-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600 border border-red-400",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
UserButton.displayName = "UserButton";

export { UserButton };
