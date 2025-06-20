import { Suspense } from 'react';
import ForgotPasswordForm from './forgot-password-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Skeleton className="h-[450px] w-full max-w-md" /></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
} 