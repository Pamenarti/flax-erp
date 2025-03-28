import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, Drawer, AppBar, Toolbar, List, CssBaseline, Typography,
  Divider, IconButton, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Menu, MenuItem, Tooltip, CircularProgress,
  Collapse, Badge, useTheme, useMediaQuery, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ExtensionIcon from '@mui/icons-material/Extension';
import api from '../config/api';

// Sidebar genişliği
const drawerWidth = 260;

// Modül ikonu seçme yardımcı fonksiyonu
const getModuleIcon = (iconName) => {
  const iconMap = {
    'DashboardIcon': <DashboardIcon />,
    'PeopleIcon': <PeopleIcon />,
    'InventoryIcon': <InventoryIcon />,
    'ShoppingCartIcon': <ShoppingCartIcon />,
    'BarChartIcon': <BarChartIcon />,
    'SettingsIcon': <SettingsIcon />,
    'LayersIcon': <LayersIcon />,
    'ShoppingBasketIcon': <ShoppingBasketIcon />,
    'AccountBalanceIcon': <AccountBalanceIcon />,
    'AssignmentIcon': <AssignmentIcon />,
    'GroupWorkIcon': <GroupWorkIcon />,
    'ExtensionIcon': <ExtensionIcon />
  };

  return iconMap[iconName] || <ExtensionIcon />;
};

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [subMenuOpen, setSubMenuOpen] = useState({});
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Stok seviyesi düşük', read: false },
    { id: 2, text: 'Yeni kullanıcı kaydoldu', read: true }
  ]);
  
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Sidebar durumunu ekran boyutuna göre ayarla
  useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);

  // Kullanıcı ve modül bilgilerini yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
          router.push('/login');
          return;
        }
        
        // Kullanıcı bilgilerini ayarla
        setUser(JSON.parse(userData));
        
        // Geliştirme mod kontrolü - API bağlantısı olmadığında varsayılan veriler kullan
        const isDevelopment = process.env.NODE_ENV === 'development';

        try {
          // SADECE AKTİF modülleri getir
          const response = await api.get('/modules/active');
          
          // Modülleri kategoriye göre grupla ve sırala
          const groupedModules = response.data.reduce((acc, module) => {
            // SADECE AKTİF olan modülleri göster
            if (module.isActive) {
              const category = module.category || 'Diğer';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(module);
              
              // Alt kategori içinde sırala
              acc[category].sort((a, b) => a.order - b.order);
            }
            return acc;
          }, {});
          
          // Kategorileri sırala - Sistem kategorisi her zaman en üstte
          const orderedModules = {};
          
          // Önce Sistem kategorisi
          if (groupedModules['Sistem']) {
            orderedModules['Sistem'] = groupedModules['Sistem'];
            delete groupedModules['Sistem'];
          }
          
          // Sonra diğer kategoriler alfabetik
          Object.keys(groupedModules)
            .sort()
            .forEach(key => {
              orderedModules[key] = groupedModules[key];
            });
          
          setModules(orderedModules);
        } catch (error) {
          console.error('Modül verileri alınamadı:', error);
          
          // Geliştirme modunda API hata verirse varsayılan modüller kullan
          if (isDevelopment) {
            console.warn('API bağlantısı yok, varsayılan temel modülleri kullanarak devam ediliyor');
            
            // Sadece temel modüller - SADECE AKTİF
            const defaultModules = {
              'Sistem': [
                { id: '1', name: 'Dashboard', icon: 'DashboardIcon', route: '/dashboard', order: 1, isActive: true },
                { id: '2', name: 'Kullanıcılar', icon: 'PeopleIcon', route: '/users', order: 2, isActive: true }
              ]
            };
            
            setModules(defaultModules);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Veri alınamadı:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleNotificationsOpen = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorElNotifications(null);
  };

  const handleSubMenuToggle = (category) => {
    setSubMenuOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Aktif menü öğesini kontrol et
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ marginRight: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Flax-ERP
          </Typography>
          
          {/* Bildirimler */}
          <Tooltip title="Bildirimler">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Kullanıcı Menüsü */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Kullanıcı ayarları">
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Bildirimler Menüsü */}
      <Menu
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 450, mt: 1 }
        }}
      >
        <Typography sx={{ p: 2, fontWeight: 'bold' }}>
          Bildirimler
        </Typography>
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>Bildirim bulunmuyor</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleNotificationsClose}>
              <ListItemIcon>
                {notification.read ? 
                  <NotificationsIcon color="disabled" /> : 
                  <NotificationsIcon color="primary" />
                }
              </ListItemIcon>
              <ListItemText 
                primary={notification.text} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  fontWeight: notification.read ? 'normal' : 'bold' 
                }}
              />
            </MenuItem>
          ))
        )}
        
        <Divider />
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography color="primary" sx={{ fontSize: 14 }}>
            Tüm Bildirimleri Görüntüle
          </Typography>
        </MenuItem>
      </Menu>
      
      {/* Kullanıcı Menüsü */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">{user?.firstName} {user?.lastName}</Typography>
          <Typography variant="body2" color="textSecondary">{user?.email}</Typography>
          <Chip 
            size="small" 
            label={user?.roles?.includes('admin') ? 'Yönetici' : 'Kullanıcı'} 
            color="primary" 
            sx={{ mt: 1 }} 
          />
        </Box>
        <Divider />
        <MenuItem onClick={() => { handleUserMenuClose(); router.push('/profile'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profil" />
        </MenuItem>
        <MenuItem onClick={() => { handleUserMenuClose(); router.push('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Ayarlar" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Çıkış Yap" />
        </MenuItem>
      </Menu>
      
      {/* Sidebar / Drawer */}
      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={open}
        onClose={isSmallScreen ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          ...(open && {
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              overflowX: 'hidden',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }),
          ...(!open && {
            '& .MuiDrawer-paper': {
              width: theme => theme.spacing(9),
              overflowX: 'hidden',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            },
          }),
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ marginLeft: 2, display: open ? 'block' : 'none' }}
            >
              Flax-ERP
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        
        {/* Ana Menü Öğeleri */}
        <List component="nav">
          <ListItem disablePadding>
            <ListItemButton 
              selected={isActive('/dashboard')} 
              onClick={() => router.push('/dashboard')}
              sx={{ 
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                bgcolor: isActive('/dashboard') ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <DashboardIcon color={isActive('/dashboard') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                sx={{ opacity: open ? 1 : 0 }} 
                primaryTypographyProps={{
                  fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
          
          {/* Kategorilere göre modül listesi */}
          {Object.entries(modules).map(([category, categoryModules]) => (
            <Box key={category}>
              {/* Kategori başlığı (genişletildiğinde görünür) */}
              {open && (
                <ListItem sx={{ pt: 2, pb: 0 }}>
                  <ListItemText
                    primary={category}
                    primaryTypographyProps={{
                      fontSize: 12,
                      fontWeight: 'bold', // Daha belirgin kategori başlığı
                      color: 'primary.main',
                      textTransform: 'uppercase',
                    }}
                  />
                </ListItem>
              )}
              
              {/* Kategori içindeki modüller */}
              {categoryModules.map(module => (
                <ListItem key={module.id} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    selected={isActive(module.route)}
                    onClick={() => router.push(module.route)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      bgcolor: isActive(module.route) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isActive(module.route) ? 'primary.main' : 'inherit',
                      }}
                    >
                      {getModuleIcon(module.icon)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={module.name} 
                      sx={{ opacity: open ? 1 : 0 }} 
                      primaryTypographyProps={{
                        fontWeight: isActive(module.route) ? 'bold' : 'normal',
                        fontSize: 14,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
          
          {/* Ayarlar */}
          <ListItem disablePadding>
            <ListItemButton 
              selected={isActive('/settings')} 
              onClick={() => router.push('/settings')}
              sx={{ 
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                bgcolor: isActive('/settings') ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <SettingsIcon color={isActive('/settings') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Ayarlar" 
                sx={{ opacity: open ? 1 : 0 }} 
                primaryTypographyProps={{
                  fontWeight: isActive('/settings') ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      
      {/* Ana İçerik */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        width: { md: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)` },
        ml: { md: open ? `${drawerWidth}px` : `${theme.spacing(9)}px` },
        transition: theme => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}>
        <Toolbar /> {/* Toolbar boşluğu */}
        {children}
      </Box>
    </Box>
  );
}
