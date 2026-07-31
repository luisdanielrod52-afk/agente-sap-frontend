import { trackSignup } from '../../../components/Analytics';
if (response.data.mensaje) {
  // 🔥 TRACKEAR EL REGISTRO EN GA4
  trackSignup('free');
  
  setExito(true);
  setTimeout(() => {
    router.push('/es/login');
  }, 2000);
}