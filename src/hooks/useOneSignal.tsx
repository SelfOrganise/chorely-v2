/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import { useCallback, useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

export function useOneSignal() {
  const isInitialized = useRef(false);

  // register notification action handler
  const registerNotificationHandler = useCallback(() => {
    OneSignal.Notifications.addEventListener('click', (e: any) => {
      // note: need to re-register after each execution https://github.com/OneSignal/OneSignal-Website-SDK/issues/436
      registerNotificationHandler();

      const split: [string, string] = e?.action?.split('@');
      if (split?.length != 2) {
        console.log('Could not process:', e.action);
        return;
      }
    });
  }, []);

  // initialize one signal
  useEffect(() => {
    if (!window) {
      return;
    }

    if (!isInitialized.current) {
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONE_SIGNAL_APP!,
        serviceWorkerParam: { scope: '/push/onesignal/' },
        serviceWorkerPath: 'push/onesignal/OneSignalSDKWorker.js',
        notificationClickHandlerMatch: 'exact',
        notificationClickHandlerAction: 'navigate',
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
        },
      })
        .then(registerNotificationHandler)
        .catch(err => console.error('Could not register OneSignalSDKWorker', err));
    }

    isInitialized.current = true;
  }, [registerNotificationHandler]);
}
