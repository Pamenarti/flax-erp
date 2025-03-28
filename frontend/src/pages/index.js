import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Card, CardContent, CardActions, Avatar } from '@mui/material';
import { useRouter } from 'next/router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  // Mevcut ve yapılacak modüllerin listesi
  const modules = [
    { 
      id: 'dashboard', 
      title: 'Dashboard', 
      description: 'Genel sistem durumu ve özet bilgiler',
      icon: <DashboardIcon fontSize="large" color="primary" />,
      status: 'active',
      url: '/dashboard'
    },
    { 
      id: 'users', 
      title: 'Kullanıcı Yönetimi', 
      description: 'Kullanıcı hesapları ve yetkilendirme',
      icon: <PeopleIcon fontSize="large" color="primary" />,
      status: 'active',
      url: '/users'
    },
    { 
      id: 'inventory', 
      title: 'Stok Yönetimi', 
      description: 'Envanter takibi ve stok hareketleri',
      icon: <InventoryIcon fontSize="large" />,
      status: 'development',
      url: '/inventory'
    },
    { 
      id: 'sales', 
      title: 'Satış Yönetimi', 
      description: 'Siparişler, müşteriler ve faturalar',
      icon: <ShoppingCartIcon fontSize="large" />,
      status: 'planned',
      url: '/sales'
    },
    { 
      id: 'reporting', 
      title: 'Raporlama', 
      description: 'İstatistikler ve detaylı raporlar',
      icon: <BarChartIcon fontSize="large" />,
      status: 'planned',
      url: '/reports'
    },
    { 
      id: 'settings', 
      title: 'Sistem Ayarları', 
      description: 'Uygulama yapılandırması ve tercihler',
      icon: <SettingsIcon fontSize="large" />,
      status: 'development',
      url: '/settings'
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success.main';
      case 'development': return 'warning.main';
      default: return 'text.disabled';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Aktif';
      case 'development': return 'Geliştiriliyor';
      default: return 'Planlama Aşamasında';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
            color: 'white',
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Flax-ERP Sistemi
            </Typography>
            <Typography variant="h6" gutterBottom>
              Modern Kurumsal Kaynak Planlama Çözümü
            </Typography>
          </Box>
          
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.main',
                  width: 56, 
                  height: 56,
                  boxShadow: 2,
                  mr: 2
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2">
                  {user?.roles?.includes('admin') ? 'Yönetici' : 'Kullanıcı'}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Paper>

        {isLoggedIn ? (
          <>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => router.push('/dashboard')}
                sx={{ mr: 2 }}
              >
                Dashboard'a Git
              </Button>
              <Button 
                variant="outlined" 
                sx={{ color: 'white', borderColor: 'white', bgcolor: 'error.main' }} 
                onClick={handleLogout}
              >
                Çıkış Yap
              </Button>
            </Box>
            
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, mt: 6 }}>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <LayersIcon sx={{ mr: 1 }} /> Mevcut Modüller ve Özellikler
              </Box>
            </Typography>
            
            <Grid container spacing={3}>
              {modules.map((module) => (
                <Grid item key={module.id} xs={12} sm={6} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        {module.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom align="center">
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        {module.description}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        align="center" 
                        sx={{ 
                          display: 'block', 
                          mt: 2, 
                          color: getStatusColor(module.status),
                          fontWeight: 'bold'
                        }}
                      >
                        {getStatusText(module.status)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        fullWidth
                        disabled={module.status !== 'active'}
                        onClick={() => router.push(module.url)}
                      >
                        {module.status === 'active' ? 'Aç' : 'Yakında'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Flax-ERP sistemini kullanmak için lütfen giriş yapın
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => router.push('/login')}
              sx={{ mt: 2 }}
            >
              Giriş Yap
            </Button>
          </Box>
        )}
        
        <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Flax-ERP v1.0.0 &copy; {new Date().getFullYear()} - Tüm hakları saklıdır.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
