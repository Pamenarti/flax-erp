import { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Card, CardContent, Divider, 
         CircularProgress, LinearProgress, List, ListItem, ListItemText, 
         ListItemIcon, Button, Avatar, Chip, CardActionArea } from '@mui/material';
import { useRouter } from 'next/router';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SettingsIcon from '@mui/icons-material/Settings';
import ExtensionIcon from '@mui/icons-material/Extension';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import api from '../config/api';

// İstatistik kartı bileşeni 
const StatCard = ({ title, value, icon, color, compareText, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 3
      } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {compareText && (
            <Typography variant="caption" color="success.main">
              {compareText}
            </Typography>
          )}
        </Box>
        <Avatar 
          sx={{ 
            bgcolor: `${color}.light`, 
            color: `${color}.main`,
            width: 56,
            height: 56
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Modül kartı bileşeni
const ModuleCard = ({ module, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}
    onClick={onClick}
  >
    <CardActionArea sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: module.isActive ? 'success.light' : 'error.light', 
              color: module.isActive ? 'success.main' : 'error.main',
              mr: 2
            }}
          >
            {module.isActive ? <LockOpenIcon /> : <LockIcon />}
          </Avatar>
          <Typography variant="h6">{module.name}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {module.description}
        </Typography>
        <Chip 
          label={module.isActive ? 'Aktif' : 'Pasif'} 
          color={module.isActive ? 'success' : 'error'} 
          size="small" 
        />
      </CardContent>
    </CardActionArea>
  </Card>
);

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    sales: 0,
    revenue: 0,
    lowStock: 0
  });
  const [activeModules, setActiveModules] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [modules, setModules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Verileri yükle
    const fetchData = async () => {
      try {
        // 1. Sunucu bilgisi
        const healthResponse = await api.get('/health');
        setServerInfo(healthResponse.data);
        
        // 2. Aktif ve tüm modülleri getir
        const [allModulesResponse, activeModulesResponse] = await Promise.all([
          api.get('/modules'),
          api.get('/modules/active')
        ]);
        
        // Tüm modüller içinden rastgele 4 tanesini göster (veya son eklenenler)
        const recentModules = allModulesResponse.data
          .sort(() => 0.5 - Math.random()) // Rastgele sırala
          .slice(0, 4);
        
        setModules(recentModules);
        setActiveModules(activeModulesResponse.data.length);
        setTotalModules(allModulesResponse.data.length);
        
        // 3. İstatistik verileri
        // TODO: Gerçek API'den almak
        setStats({
          users: 24,
          products: 156,
          sales: 28,
          revenue: 14850,
          lowStock: 5
        });
        
        // 4. Uyarılar - Stok uyarılarını ekledik
        setAlerts([
          {
            id: 1,
            type: 'success',
            message: 'Sistem başarıyla güncellendi',
            time: '10 dakika önce'
          },
          {
            id: 2,
            type: 'error',
            message: 'Stok azalıyor: Ürün #1234',
            time: '1 saat önce',
            link: '/inventory'
          },
          {
            id: 3,
            type: 'info',
            message: 'Yeni kullanıcı kaydoldu',
            time: '3 saat önce'
          },
          {
            id: 4,
            type: 'warning',
            message: '5 ürün kritik stok seviyesinde',
            time: '2 saat önce',
            link: '/inventory?tab=low-stock'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Veri alınamadı:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Karşılama kartı */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Hoş Geldiniz, {user?.firstName}!
        </Typography>
        <Typography variant="body1">
          Flax-ERP sisteminin gösterge paneline erişim sağladınız. Bu panel üzerinden sistem durumunu izleyebilir 
          ve temel verilere erişebilirsiniz.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Ortam: ${serverInfo?.environment || 'Development'}`} 
            color="primary" 
            variant="outlined" 
            sx={{ mr: 1, mb: 1, color: 'white', borderColor: 'white' }} 
          />
          <Chip 
            label={`Durum: ${serverInfo?.status || 'İyi'}`} 
            color="success" 
            variant="outlined" 
            sx={{ mr: 1, mb: 1, color: 'white', borderColor: 'white' }} 
          />
          <Chip 
            label={`Aktif Modüller: ${activeModules}/${totalModules}`} 
            color="secondary" 
            variant="outlined" 
            sx={{ mb: 1, color: 'white', borderColor: 'white' }} 
          />
        </Box>
      </Paper>
      
      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Toplam Kullanıcı" 
            value={stats.users} 
            icon={<PeopleIcon />}
            color="primary"
            compareText="+2 bu hafta"
            onClick={() => router.push('/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Ürün Sayısı" 
            value={stats.products} 
            icon={<InventoryIcon />}
            color="success"
            compareText={`${stats.lowStock} ürün düşük stokta`}
            onClick={() => router.push('/inventory')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Satışlar" 
            value={stats.sales} 
            icon={<ShoppingCartIcon />}
            color="warning"
            compareText="+5 dün"
            onClick={() => router.push('/sales')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Gelir (₺)" 
            value={stats.revenue.toLocaleString()} 
            icon={<StorefrontIcon />}
            color="error"
            compareText="+2.350₺ bu hafta"
            onClick={() => router.push('/reports')}
          />
        </Grid>
      </Grid>
      
      {/* Modül Durumu ve Son Eklenen Modüller */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ExtensionIcon sx={{ mr: 1 }} /> Modül Durumu
          </Typography>
          <Button variant="outlined" size="small" onClick={() => router.push('/settings/modules')}>
            Tüm Modülleri Yönet
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {modules.map(module => (
            <Grid item xs={12} sm={6} key={module.id}>
              <ModuleCard 
                module={module} 
                onClick={() => router.push('/settings/modules')}
              />
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Aktif Modüller: {activeModules}/{totalModules}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(activeModules / totalModules) * 100} 
            sx={{ width: '70%', height: 10, borderRadius: 5 }}
          />
        </Box>
      </Paper>
      
      {/* Grafikler ve Tablolar */}
      <Grid container spacing={3}>
        {/* Sistem Durumu */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1 }} /> Sistem Performansı
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">CPU Kullanımı</Typography>
                <Typography variant="body2">32%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={32} />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Bellek Kullanımı</Typography>
                <Typography variant="body2">68%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={68} color="warning" />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Disk Kullanımı</Typography>
                <Typography variant="body2">45%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={45} color="info" />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Network Trafiği</Typography>
                <Typography variant="body2">22%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={22} color="success" />
            </Box>
            
            <Button variant="outlined" fullWidth>
              Detaylı Analiz
            </Button>
          </Paper>
        </Grid>
        
        {/* Bildirimler ve Uyarılar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Son Bildirimler
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <List>
              {alerts.map((alert) => (
                <ListItem 
                  key={alert.id} 
                  divider
                  button={!!alert.link}
                  onClick={() => alert.link && router.push(alert.link)}
                >
                  <ListItemIcon>
                    {alert.type === 'success' ? (
                      <CheckCircleIcon color="success" />
                    ) : alert.type === 'error' ? (
                      <ErrorIcon color="error" />
                    ) : alert.type === 'warning' ? (
                      <NotificationsIcon color="warning" />
                    ) : (
                      <NotificationsIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={alert.message} 
                    secondary={alert.time} 
                  />
                </ListItem>
              ))}
            </List>
            
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              Tüm Bildirimleri Görüntüle
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Bilgi metni */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Flax-ERP, modüler yapısı ile ihtiyaçlarınıza uygun şekilde özelleştirilebilir.
          Modül yönetimi sayfasından yeni modüller ekleyebilir veya mevcut modülleri devre dışı bırakabilirsiniz.
        </Typography>
      </Box>
    </Container>
  );
}

// ModuleGuard ile sarmala ve export et
export default function DashboardWithGuard() {
  return (
    <ModuleGuard moduleCode="core">
      <Dashboard />
    </ModuleGuard>
  );
}
