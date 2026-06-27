import { useEffect } from 'react';
import { useStore } from './store';
import { api } from './api';

// A chave pública VAPID (deve ser a mesma definida no backend)
const VAPID_PUBLIC_KEY = 'BPuVgG3tnQhPuSSk5V_msyDygOgeUx7DLLrl_9YEYuzvd0clKlnZsrpZIKm_ivQLMWz522laK2X7Woz_kX4LuJw';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePush() {
  const { player } = useStore();

  useEffect(() => {
    if (!player || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    async function registerPush() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Pergunta permissão
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        }

        // Envia pro backend
        await api.pushSubscribe(player.id, subscription);
      } catch (err) {
        console.error('Push Registration falhou:', err);
      }
    }

    registerPush();
  }, [player]);
}
