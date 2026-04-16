"use client";

import { XIcon } from "lucide-react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-100 bg-black/60 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Conteúdo do alerta: usa um wrapper com flex + scroll (padrão de modal)
 * para ficar centralizado no viewport no mobile, inclusive com drawer (Vaul) aberto.
 */
function AlertDialogContent({
  className,
  children,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <AlertDialogPortal>
      <div className="pointer-events-auto fixed inset-0 z-100 isolate overflow-y-auto overscroll-y-contain">
        <div className="relative flex min-h-full items-center justify-center p-4 py-8 sm:p-6">
          <AlertDialogPrimitive.Overlay
            data-slot="alert-dialog-overlay"
            className={cn(
              "absolute inset-0 bg-black/60 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            )}
          />
          <AlertDialogPrimitive.Content
            data-slot="alert-dialog-content"
            className={cn(
              "relative z-10 grid w-full max-w-md min-w-0 gap-4 rounded-2xl p-6 text-center text-on-surface outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className,
            )}
            {...props}
          >
            {children}
            {showCloseButton && (
              <AlertDialogPrimitive.Cancel asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2 border border-outline/40 bg-surface-container-low/90 text-on-surface-variant shadow-none hover:bg-surface-bright/50 hover:text-on-surface focus-visible:border-red-500/45 focus-visible:ring-2 focus-visible:ring-red-500/25"
                >
                  <XIcon />
                  <span className="sr-only">Fechar</span>
                </Button>
              </AlertDialogPrimitive.Cancel>
            )}
          </AlertDialogPrimitive.Content>
        </div>
      </div>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-headline text-lg font-bold tracking-tight text-white",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "font-body text-sm text-on-surface-variant *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-on-surface",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
