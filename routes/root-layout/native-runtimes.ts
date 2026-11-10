import NotificationRuntime from '@Routes/notifications/notification-runtime/notification-runtime';
import PushTokenRuntime from '@Routes/notifications/push-token-runtime/push-token-runtime';

const NATIVE_RUNTIMES = [
  { id: 'notification', component: NotificationRuntime },
  { id: 'push-token', component: PushTokenRuntime },
];

export default NATIVE_RUNTIMES;
