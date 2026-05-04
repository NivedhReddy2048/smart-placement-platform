import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/context/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Only logged in users can see any sub-routes of /dashboard/*
    <ProtectedRoute>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
