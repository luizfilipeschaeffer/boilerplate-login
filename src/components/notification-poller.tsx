'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function NotificationPoller() {
  const { data: notifications } = useSWR<Notification[]>(
    '/api/notifications',
    fetcher,
    {
      refreshInterval: 15000, // 15 segundos
      revalidateOnFocus: true,
    }
  );

  // Efeito para solicitar permissão de notificação nativa.
  useEffect(() => {
    const permissionRequested = localStorage.getItem(
      'notificationPermissionRequested'
    );

    if (
      !permissionRequested &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().then(() => {
        localStorage.setItem('notificationPermissionRequested', 'true');
      });
    }
  }, []);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      notifications.forEach(notification => {
        // Verifica se temos permissão para enviar notificações nativas.
        if ('Notification' in window && Notification.permission === 'granted') {
          // Mostra a notificação nativa do sistema.
          new Notification('Nova Notificação', {
            body: notification.message,
            // Você pode adicionar um ícone aqui se desejar, ex: icon: '/icon.png'
          });
        } else {
          // Se não tivermos permissão, usa o sistema de toast como fallback.
          switch (notification.type) {
            case 'success':
              toast.success(notification.message);
              break;
            case 'error':
              toast.error(notification.message);
              break;
            case 'warning':
              toast.warning(notification.message);
              break;
            default:
              toast.info(notification.message);
              break;
          }
        }
      });
    }
  }, [notifications]);

  // Este componente não renderiza nada na tela.
  return null;
} 