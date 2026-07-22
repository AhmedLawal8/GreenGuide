import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";

type Toast = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const id = nextToastId++;
    setToast({ id, message });

    timeoutRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Flex key={toast.id} align="center" gap="2" className="save-toast" role="status" aria-live="polite">
          <CheckCircledIcon width="16" height="16" />
          <Text size="2" weight="medium">
            {toast.message}
          </Text>
        </Flex>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
