import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, CircularProgress, Paper, Container, Alert } from '@mui/material';
import ExtensionOffIcon from '@mui/icons-material/ExtensionOff';
import api from '../config/api';

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

    // Geliştirme modunda test için - API yok ise geçici bypass et
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Modülün aktif olup olmadığını kontrol et
    const checkModule = async () => {
      try {
        // Geliştirme modunda API bypass seçeneği (hızlı geliştirme için)
        if (isDevelopment && moduleCode) {
          console.warn('API bağlantısı yok, geliştirme modunda ModuleGuard bypass ediliyor');
          setIsModuleActive(true);
          setLoading(false);
          return;
        }
        
        // Tüm aktif modülleri getir
        const response = await api.get('/modules/active');
        const activeModules = response.data;
        
        // Modül kontrolü
        const isActive = activeModules.some(module => module.code === moduleCode);
        setIsModuleActive(isActive);
        setLoading(false);
      } catch (error) {
        console.error('Modül kontrolü yapılamadı:', error);
        
        // Geliştirme modunda API çalışmıyorsa geçici olarak erişime izin ver
        if (isDevelopment) {
          console.warn('API bağlantısı yok, geliştirme modunda erişime izin veriliyor');
          setIsModuleActive(true);
          setLoading(false);
        } else {
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
