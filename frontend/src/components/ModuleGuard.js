import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, CircularProgress, Paper, Container, Alert } from '@mui/material';
import ExtensionOffIcon from '@mui/icons-material/ExtensionOff';
import api from '../config/api';
import { getDefaultModules } from '../mock/modules-mock';

// ModuleGuard bileşeni: Bir modülün aktif olup olmadığını kontrol eder
const ModuleGuard = ({ children, moduleCode }) => {
  const [loading, setLoading] = useState(true);
  const [isModuleActive, setIsModuleActive] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Geliştirme modu ve API mock kontrolü
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isMockEnabled = process.env.API_MOCK_ENABLED === 'true';

    // Modülün aktif olup olmadığını kontrol et
    const checkModule = async () => {
      try {
        // API mock kontrolü - geliştirme sırasında API'ye bağlı olmadan çalışabilmek için
        if (isDevelopment && isMockEnabled) {
          console.warn('API mock modu aktif, gerçek API yerine mock veriler kullanılıyor');
          
          // Core ve settings modülleri her zaman aktif
          if (moduleCode === 'core' || moduleCode === 'settings' || moduleCode === 'users') {
            setIsModuleActive(true);
            setLoading(false);
            return;
          }
          
          // Mock modüller
          const mockModules = getDefaultModules();
          const isActive = mockModules.some(module => module.code === moduleCode && module.isActive);
          setIsModuleActive(isActive);
          setLoading(false);
          return;
        }
        
        // Gerçek API isteği - tüm aktif modülleri getir
        const response = await api.get('/modules/active');
        const activeModules = response.data;
        
        // Modül kontrolü - açık olan modüllerde var mı?
        const isActive = activeModules.some(module => module.code === moduleCode);
        setIsModuleActive(isActive);
        setLoading(false);
      } catch (error) {
        console.error('Modül kontrolü yapılamadı:', error);
        
        // Geliştirme modunda API çalışmıyorsa geliştirmeyi kolaylaştırmak için
        if (isDevelopment) {
          console.warn('API bağlantısı yok, temel modüllere erişim otomatik olarak sağlanıyor');
          
          // Geliştirme modunda tüm sayfalara erişim sağla
          if (moduleCode === 'core' || moduleCode === 'settings' || moduleCode === 'users') {
            setIsModuleActive(true);
          } else {
            // Sadece inventory modülüne erişim sağla, diğerleri için erişimi engelle
            setIsModuleActive(moduleCode === 'inventory');
          }
          setLoading(false);
        } else {
          // Üretim modunda hatayı göster
          setError('Modül durumu kontrol edilirken bir hata oluştu. API bağlantısı kontrol edin.');
          setLoading(false);
          setIsModuleActive(false);
        }
      }
    };

    checkModule();
  }, [moduleCode, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Hata durumunda kullanıcıyı bilgilendir
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Typography variant="body1" paragraph>
            API sunucusuna bağlanırken sorun oluştu. Lütfen sunucunun çalıştığından ve bağlantı ayarlarının doğru olduğundan emin olun.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={() => router.push('/dashboard')}
              sx={{ mr: 2 }}
            >
              Dashboard'a Dön
            </Button>
            <Button 
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Modül aktif değilse erişim reddedildi mesajı göster
  if (!isModuleActive) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ExtensionOffIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Modül Etkin Değil
          </Typography>
          <Typography variant="body1" paragraph>
            "{moduleCode}" modülü etkinleştirilmemiş. Bu sayfaya erişmek için sistem yöneticinize başvurun veya modülü etkinleştirin.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={() => router.push('/dashboard')}
              sx={{ mr: 2 }}
            >
              Dashboard'a Dön
            </Button>
            {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).roles?.includes('admin') && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => router.push('/settings/modules')}
              >
                Modül Ayarları
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }

  // Modül aktifse içeriği göster
  return children;
};

export default ModuleGuard;
