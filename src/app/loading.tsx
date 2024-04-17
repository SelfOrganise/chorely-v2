'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Loading() {
  useEffect(() => {
    const loading = toast.loading('Loading...', { position: 'bottom-right' });

    return () => toast.dismiss(loading);
  });

  return null;
}
