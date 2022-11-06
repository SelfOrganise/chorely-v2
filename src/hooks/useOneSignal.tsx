import { useCallback, useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

const isProd = process.env.NODE_ENV === 'production';

export function useOneSignal() {
  const isInitialized = useRef(false);

  // register notification action handler
  const registerNotificationHandler = useCallback(() => {
    OneSignal.addListenerForNotificationOpened((e: any) => {
      // note: need to re-register after each execution https://github.com/OneSignal/OneSignal-Website-SDK/issues/436
      registerNotificationHandler();

      const split: [string, string] = e?.action?.split('@');
      if (split?.length != 2) {
        console.log('Could not process:', e.action);
        return;
      }

      const [action, id] = split;
    });
  }, []);

  // initialize one signal
  useEffect(() => {
    if (!window) {
      return;
    }

    if (!isInitialized.current) {
      OneSignal.init({
        appId: '52db2cee-fecc-4440-af71-ec48873504e0',
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
