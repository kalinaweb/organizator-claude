'use client';

import { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isLocalMode } from '@/lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();
    const local = isLocalMode();
    if (!authenticated && !local) {
      router.push('/welcome');
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
