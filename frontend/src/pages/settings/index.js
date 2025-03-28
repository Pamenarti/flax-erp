import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, Card, CardContent, 
  CardActionArea, Divider, AppBar, Toolbar, IconButton, 
  List, ListItem, ListItemText, ListItemIcon, CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExtensionIcon from '@mui/icons-material/Extension';
import StorageIcon from '@mui/icons-material/Storage';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BackupIcon from '@mui/icons-material/Backup';
import BuildIcon from '@mui/icons-material/Build';
import api from '../../config/api';
import ModuleGuard from '../../components/ModuleGuard';

// Renamed to SettingsContent to avoid naming collision
function SettingsContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeModules, setActiveModules] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchModules();
  }, [router]);

  const fetchModules = async () => {
    try {
      const response = await api.get('/modules/active');
      setActiveModules(response.data.length);
      setLoading(false);
    } catch (error) {
      console.error('Modüller alınamadı:', error);
      setLoading(false);
    }
  };

  const settingsOptions = [
    {
      title: 'Modül Yönetimi',
      description: 'Modülleri etkinleştirin veya devre dışı bırakın',
      icon: <ExtensionIcon fontSize="large" color="primary" />,
      route: '/settings/modules'
    },
    {
      title: 'Genel Ayarlar',
      description: 'Sistem genelinde geçerli ayarlar',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      route: '/settings/general'
    },
    {
      title: 'Güvenlik Ayarları',
      description: 'Şifre politikaları ve güvenlik seçenekleri',
      icon: <SecurityIcon fontSize="large" color="primary" />,
      route: '/settings/security'
    },
    {
      title: 'Bölgesel Ayarlar',
      description: 'Dil, saat dilimi ve para birimi ayarları',
      icon: <LanguageIcon fontSize="large" color="primary" />,
      route: '/settings/regional'
    },
    {
      title: 'Tema ve Görünüm',
      description: 'Arayüz renkleri ve görsel özelleştirmeler',
      icon: <ColorLensIcon fontSize="large" color="primary" />,
      route: '/settings/appearance'
    },
    {
      title: 'Veritabanı Yönetimi',
      description: 'Yedekleme ve veri işlemleri',
      icon: <StorageIcon fontSize="large" color="primary" />,
      route: '/settings/database'
    },
    {
      title: 'Bildirim Ayarları',
      description: 'E-posta ve sistem içi bildirim yapılandırması',
      icon: <NotificationsIcon fontSize="large" color="primary" />,
      route: '/settings/notifications'
    },
    {
      title: 'Yedekleme ve Geri Yükleme',
      description: 'Sistem yedekleme ve geri yükleme işlemleri',
      icon: <BackupIcon fontSize="large" color="primary" />,
      route: '/settings/backup'
    },
    {
      title: 'Bakım Modu',
      description: 'Sistem bakım ayarları ve programlama',
      icon: <BuildIcon fontSize="large" color="primary" />,
      route: '/settings/maintenance'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Admin kontrolü
  if (user && !user.roles?.includes('admin')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Erişim Reddedildi
          </Typography>
          <Typography variant="body1">
            Bu sayfaya erişim için yönetici yetkileri gereklidir.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => router.push('/dashboard')}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistem Ayarları
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Sistem Yapılandırması
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Flax-ERP sisteminin ayarlarını bu sayfadan yapılandırabilirsiniz.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Aktif Modüller:</Typography>
                  <Typography variant="h4">{activeModules}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Sistem Sürümü:</Typography>
                  <Typography variant="h4">1.0.0</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Son Güncelleme:</Typography>
                  <Typography variant="h4">{new Date().toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {settingsOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  sx={{ height: '100%' }}
                  onClick={() => router.push(option.route)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box sx={{ p: 1, mb: 2 }}>
                        {option.icon}
                      </Box>
                      <Typography variant="h6" component="div" gutterBottom>
                        {option.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// Only one default export now
export default function SettingsWithGuard() {
  return (
    <ModuleGuard moduleCode="settings">
      <SettingsContent />
    </ModuleGuard>
  );
}
