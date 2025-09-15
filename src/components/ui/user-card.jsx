import React from 'react';
import { cn } from '@/lib/utils';

const UserCard = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "user-card rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow",
      className
    )}
    {...props}
  />
));
UserCard.displayName = "UserCard";

const UserCardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
UserCardHeader.displayName = "UserCardHeader";

const UserCardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
UserCardTitle.displayName = "UserCardTitle";

const UserCardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
UserCardDescription.displayName = "UserCardDescription";

const UserCardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
UserCardContent.displayName = "UserCardContent";

const UserCardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
UserCardFooter.displayName = "UserCardFooter";

export { UserCard, UserCardHeader, UserCardFooter, UserCardTitle, UserCardDescription, UserCardContent };
