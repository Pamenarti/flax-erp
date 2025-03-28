import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, CircularProgress, Paper, Container } from '@mui/material';
import ExtensionOffIcon from '@mui/icons-material/ExtensionOff';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../config/api';

// ModuleGuard bileşeni: Bir modülün aktif olup olmadığını kontrol eder
const ModuleGuard = ({ children, moduleCode }) => {
  const [loading, setLoading] = useState(true);
  const [isModuleActive, setIsModuleActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Kullanıcı admin mi kontrol et
    if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.roles?.includes('admin') || false);
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
            <strong>{moduleCode}</strong> modülü şu anda etkinleştirilmemiş. Erişmek için sistem yöneticinize başvurun veya sistem ayarlarından modülü etkinleştirin.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => router.push('/dashboard')}
              startIcon={<ExtensionOffIcon />}
            >
              Ana Sayfaya Dön
            </Button>
            
            {isAdmin && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => router.push('/settings/modules')}
                startIcon={<SettingsIcon />}
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
