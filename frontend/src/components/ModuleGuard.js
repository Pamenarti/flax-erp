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

    // Modülün aktif olup olmadığını kontrol et
    const checkModule = async () => {
      try {
        // Tüm aktif modülleri getir
        const response = await api.get('/modules/active');
        const activeModules = response.data;
        
        // Modül kontrolü
        const isActive = activeModules.some(module => module.code === moduleCode);
        setIsModuleActive(isActive);
        setLoading(false);
      } catch (error) {
        console.error('Modül kontrolü yapılamadı:', error);
        setError('Modül durumu kontrol edilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
        
        // Hata durumunda varsayılan davranış (artık erişime izin vermiyoruz)
        setIsModuleActive(false);
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
            Modül durumu kontrol edilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin veya sistem yöneticinize başvurun.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/login')}
            sx={{ mt: 2 }}
          >
            Yeniden Giriş Yap
          </Button>
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
              onClick={() => router.push('/login')}
              sx={{ mr: 2 }}
            >
              Ana Sayfa
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
