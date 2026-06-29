// 1. Unificamos los imports en una sola línea
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Mantenemos el cliente fuera del componente para evitar que se reinicie en cada re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}