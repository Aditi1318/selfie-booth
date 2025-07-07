import {useToast} from "@/hooks/use-toast";
import {Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from "@/components/ui/Toast";

export function Toaster() {
    const {toasts} = useToast();

    return (
        <ToastProvider>
            {toasts.map((toast) => {
                const {id, title, description, action, ...rest} = toast;
                return (
                    <Toast key={id} {...rest}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && <ToastDescription>{description}</ToastDescription>}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
