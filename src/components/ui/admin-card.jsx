import React from 'react';
import { cn } from '@/lib/utils';

const AdminCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "admin-card rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
AdminCard.displayName = "AdminCard";

const AdminCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
AdminCardHeader.displayName = "AdminCardHeader";

const AdminCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AdminCardTitle.displayName = "AdminCardTitle";

const AdminCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AdminCardDescription.displayName = "AdminCardDescription";

const AdminCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
AdminCardContent.displayName = "AdminCardContent";

const AdminCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
AdminCardFooter.displayName = "AdminCardFooter";

export { AdminCard, AdminCardHeader, AdminCardFooter, AdminCardTitle, AdminCardDescription, AdminCardContent };
