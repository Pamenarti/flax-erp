import { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Divider, 
         CircularProgress, LinearProgress, List, ListItem, ListItemText, 
         ListItemIcon, Button, Chip, Card, CardActionArea,
         CardContent, Avatar } from '@mui/material';
import { useRouter } from 'next/router';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExtensionIcon from '@mui/icons-material/Extension';
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
const ModuleCard = ({ module, onClick }) => {
  // İkon haritası
  const getIcon = (iconName) => {
    const iconMap = {
      'PeopleIcon': <PeopleIcon fontSize="large" />,
      'InventoryIcon': <InventoryIcon fontSize="large" />,
      'ShoppingCartIcon': <ShoppingCartIcon fontSize="large" />,
      'BarChartIcon': <BarChartIcon fontSize="large" />,
      'ExtensionIcon': <ExtensionIcon fontSize="large" />,
    };
    return iconMap[iconName] || <ExtensionIcon fontSize="large" />;
  };
  
  return (
    <Card
      sx={{
        height: '100%',
        opacity: module.isActive ? 1 : 0.6,
        transition: 'all 0.2s'
      }}
    >
      <CardActionArea
        sx={{ height: '100%', p: 2 }}
        onClick={onClick}
        disabled={!module.isActive}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Avatar
            sx={{
              bgcolor: module.isActive ? 'primary.light' : 'grey.300',
              color: module.isActive ? 'primary.main' : 'grey.500',
              width: 64,
              height: 64,
              mb: 2
            }}
          >
            {getIcon(module.icon)}
          </Avatar>
          <Typography variant="h6" component="div" gutterBottom>
            {module.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {module.description}
          </Typography>
          <Chip
            label={module.isActive ? 'Etkin' : 'Devre Dışı'}
            color={module.isActive ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverInfo, setServerInfo] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    sales: 0,
    revenue: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [modules, setModules] = useState([]);
  
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
        
        // 2. Aktif modülleri getir
        const allModulesResponse = await api.get('/modules');
        setModules(allModulesResponse.data);
        
        // 3. İstatistik verileri - Mock edilmiş ve stok bilgilerini ekledik
        // Gerçek uygulamada bu veriler API'den gelecek
        setStats({
          users: 24,
          products: 156,
          sales: 28,
          revenue: 14850,
          lowStock: 5  // Düşük stok ürün sayısı
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

  // Modülleri kategorilere göre grupla
  const operationalModules = modules.filter(m => m.category === 'Operasyon');
  const activeModulesCount = modules.filter(m => m.isActive).length;
  const totalModules = modules.length;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              label={`Aktif Modüller: ${activeModulesCount}/${totalModules}`} 
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
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Gelir (₺)" 
              value={stats.revenue.toLocaleString()} 
              icon={<StorefrontIcon />}
              color="error"
              compareText="+2.350₺ bu hafta"
            />
          </Grid>
        </Grid>
        
        {/* Modüller */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ExtensionIcon sx={{ mr: 1 }} /> Modüller
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Aşağıdaki modüller sisteminizde kurulu. Modül durumları ve bilgileri için tıklayın.
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            {operationalModules.map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module.id}>
                <ModuleCard 
                  module={module} 
                  onClick={() => {
                    if (module.isActive) {
                      router.push(module.route);
                    } else {
                      router.push('/settings/modules');
                    }
                  }}
                />
              </Grid>
            ))}
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', border: '2px dashed #ccc' }}>
                <CardActionArea 
                  sx={{ height: '100%', p: 2 }}
                  onClick={() => router.push('/settings/modules')}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'action.hover', width: 64, height: 64, mb: 2 }}>
                      <ExtensionIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" component="div" gutterBottom>
                      Modül Ekle
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Sisteminize yeni modüller ekleyin veya mevcut modülleri yönetin
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
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
            Bu dashboard şu an demo amaçlıdır. Gerçek veri entegrasyonları yakında eklenecektir.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
