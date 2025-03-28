import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, CircularProgress, Paper, Container } from '@mui/material';
import ExtensionOffIcon from '@mui/icons-material/ExtensionOff';
import api from '../config/api';

// ModuleGuard bileşeni: Bir modülün aktif olup olmadığını kontrol eder
const ModuleGuard = ({ children, moduleCode }) => {
  const [loading, setLoading] = useState(true);
  const [isModuleActive, setIsModuleActive] = useState(false);
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
        setLoading(false);
        // Hata durumunda varsayılan olarak modülü aktif kabul edelim (sistem çalışmaya devam etsin)
        setIsModuleActive(true);
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

  // Modül aktif değilse erişim reddedildi mesajı göster
  if (!isModuleActive) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ExtensionOffIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Modül Etkin Değil
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Bu modül şu anda etkinleştirilmemiş. Erişmek için sistem yöneticinize başvurun veya sistem ayarlarından modülü etkinleştirin.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => router.push('/dashboard')}>
              Dashboard'a Dön
            </Button>
            {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).roles?.includes('admin') && (
              <Button 
                variant="outlined" 
                sx={{ ml: 2 }}
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
