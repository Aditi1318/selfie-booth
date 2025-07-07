import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import {Slot} from "@radix-ui/react-slot";
import {Controller, FormProvider, useFormContext} from "react-hook-form";

import {cn} from "@/lib/Utils";
import {Label} from "@/components/ui/Label";

// Form context provider
const Form = FormProvider;

// FormField Context
const FormFieldContext = React.createContext({});

const FormField = (props) => {
    return (
        <FormFieldContext.Provider value={{name: props.name}}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

// FormItem Context
const FormItemContext = React.createContext({});

// Hook to consume form field context and field state
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const {getFieldState, formState} = useFormContext();

    if (!fieldContext || !fieldContext.name) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const fieldState = getFieldState(fieldContext.name, formState);
    const {id} = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};

// FormItem wrapper
const FormItem = React.forwardRef(({className, ...props}, ref) => {
    const id = React.useId();

    return (
        <FormItemContext.Provider value={{id}}>
            <div ref={ref} className={cn("space-y-2", className)} {...props} />
        </FormItemContext.Provider>
    );
});
FormItem.displayName = "FormItem";

// Label for the form field
const FormLabel = React.forwardRef(({className, ...props}, ref) => {
    const {error, formItemId} = useFormField();

    return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";

// Control wrapper that connects to aria-* and accessibility
const FormControl = React.forwardRef(({...props}, ref) => {
    const {error, formItemId, formDescriptionId, formMessageId} = useFormField();

    return (
        <Slot
            ref={ref}
            id={formItemId}
            aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
            aria-invalid={!!error}
            {...props}
        />
    );
});
FormControl.displayName = "FormControl";

// Description below the input field
const FormDescription = React.forwardRef(({className, ...props}, ref) => {
    const {formDescriptionId} = useFormField();

    return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";

// Error message handler
const FormMessage = React.forwardRef(({className, children, ...props}, ref) => {
    const {error, formMessageId} = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) return null;

    return (
        <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
            {body}
        </p>
    );
});
FormMessage.displayName = "FormMessage";

// Export all components
export {useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField};
