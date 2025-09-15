import React from 'react';
import { cn } from '@/lib/utils';

const AdminButton = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500",
    outline: "border border-gray-400 text-gray-200 hover:bg-gray-600 hover:text-white hover:border-gray-300",
    secondary: "bg-gray-600 text-white hover:bg-gray-500 border border-gray-500",
    ghost: "text-gray-300 hover:text-white hover:bg-gray-700",
    destructive: "bg-red-600 text-white hover:bg-red-700 border border-red-500",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  const Comp = asChild ? 'div' : 'button';

  return (
    <Comp
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
AdminButton.displayName = "AdminButton";

export { AdminButton };
