import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps {
  children?: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
}

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({ children, value, onValueChange, defaultValue }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
    triggerRef.current?.focus() // Ensure trigger is focused after selection
  }

  React.useEffect(() => {
    if (open) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false)
          triggerRef.current?.focus()
        }
      }
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [open, setOpen, triggerRef])

  React.useEffect(() => {
    if (open) {
      // Try to focus the first selectable item, or the content itself if no items.
      const firstItem = contentRef.current?.querySelector('[role="option"]') as HTMLElement | null
      if (firstItem) {
        firstItem.focus()
      } else {
        contentRef.current?.focus()
      }
    } else {
      // Focus trigger if focus was within content and trigger is not already focused
      if (contentRef.current?.contains(document.activeElement) && document.activeElement !== triggerRef.current) {
        triggerRef.current?.focus()
      }
    }
  }, [open, contentRef, triggerRef])

  const contextValue = React.useMemo(() => ({
    value: currentValue,
    onValueChange: handleValueChange,
    open,
    setOpen,
    triggerRef,
    contentRef
  }), [currentValue, handleValueChange, open, setOpen, triggerRef, contentRef])

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Using displayName to identify components for ref passing
            const childType = child.type as any;
            if (childType.displayName === "SelectTrigger") {
              return React.cloneElement(child as React.ReactElement<SelectTriggerProps>, { ref: triggerRef });
            }
            if (childType.displayName === "SelectContent") {
              return React.cloneElement(child as React.ReactElement<SelectContentProps>, { ref: contentRef });
            }
          }
          return child;
        })}
      </div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")
    
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context.setOpen(!context.open)}
        aria-haspopup="listbox"
        aria-expanded={context.open}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  
  return <span>{context.value || placeholder}</span>
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")
    
    if (!context.open) return null
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!context.contentRef.current) return

      const items = Array.from(context.contentRef.current.querySelectorAll('[role="option"]')) as HTMLElement[]
      if (items.length === 0) return

      const currentIndex = items.findIndex(item => item === document.activeElement)

      if (event.key === "ArrowDown") {
        event.preventDefault()
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length
        items[nextIndex]?.focus()
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        const prevIndex = currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
        items[prevIndex]?.focus()
      }
      // Optional: Home/End key support
      // else if (event.key === "Home") {
      //   event.preventDefault();
      //   items[0]?.focus();
      // } else if (event.key === "End") {
      //   event.preventDefault();
      //   items[items.length - 1]?.focus();
      // }
    }

    return (
      <div
        ref={ref}
        role="listbox"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg",
          className
        )}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children?: React.ReactNode
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")
    
    return (
      <div
        ref={ref}
        role="option"
        tabIndex={-1}
        aria-selected={context.value === value}
        onClick={() => context.onValueChange?.(value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            context.onValueChange?.(value)
            // context.setOpen(false) // Already handled in onValueChange
          }
        }}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[selected=true]:bg-gray-100 data-[selected=true]:dark:bg-gray-800",
          className
        )}
        data-selected={context.value === value}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"