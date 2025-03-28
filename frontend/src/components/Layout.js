import { useState, useEffect } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  IconButton, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Avatar, Menu, MenuItem, Tooltip, Badge,
  Collapse, useTheme, useMediaQuery, CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExtensionIcon from '@mui/icons-material/Extension';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import api from '../config/api';

// Drawer genişliği
const drawerWidth = 260;

// İkon bileşeni
const ModuleIcon = ({ iconName, status }) => {
  // İkon haritası - iconName string'ini React komponenti ile eşleştirir
  const iconMap = {
    'DashboardIcon': <DashboardIcon />,
    'PeopleIcon': <PeopleIcon />,
    'InventoryIcon': <InventoryIcon />,
    'ShoppingCartIcon': <ShoppingCartIcon />,
    'SettingsIcon': <SettingsIcon />,
    'ExtensionIcon': <ExtensionIcon />,
    'ShoppingBasketIcon': <ShoppingBasketIcon />,
    'AccountBalanceIcon': <AccountBalanceIcon />,
    'BarChartIcon': <BarChartIcon />,
    'AssignmentIcon': <AssignmentIcon />,
    'GroupWorkIcon': <GroupWorkIcon />,
  };

  // Eğer status inactive ise, ikonu gri yap
  const style = status === 'inactive' ? { color: 'text.disabled' } : {};

  return iconMap[iconName] ? (
    <Box sx={style}>
      {iconMap[iconName]}
    </Box>
  ) : <ExtensionIcon />;
};

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [activeModules, setActiveModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState({});
  
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Kullanıcı ve modül bilgilerini yükle
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    const fetchModules = async () => {
      try {
        // Tüm modülleri ve aktif modülleri çek
        const [activeResponse, allResponse] = await Promise.all([
          api.get('/modules/active'),
          api.get('/modules')
        ]);
        
        setActiveModules(activeResponse.data);
        setAllModules(allResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Modül bilgileri alınamadı:', error);
        setLoading(false);
      }
    };
    
    fetchModules();
  }, [router]);

  // Mobil görünüm için drawer'ı kapalı başlat
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Alt menülerin açık/kapalı durumunu değiştir
  const handleSubMenuToggle = (category) => {
    setOpenSubMenu({
      ...openSubMenu,
      [category]: !openSubMenu[category]
    });
  };

  // Eğer modüle erişim varsa tıklamaya izin ver, yoksa uyarı göster
  const handleModuleClick = (module) => {
    if (module.isActive) {
      router.push(module.route);
    } else {
      alert(`${module.name} modülü şu anda devre dışı. Etkinleştirmek için modül yönetimine gidin.`);
    }
  };

  // Modülleri kategorilere göre grupla
  const groupModulesByCategory = () => {
    return allModules.reduce((acc, module) => {
      const category = module.category || 'Diğer';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(module);
      return acc;
    }, {});
  };

  // Modülün aktif olup olmadığını kontrol et
  const isModuleActive = (moduleCode) => {
    return activeModules.some(m => m.code === moduleCode);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Kategorilere göre gruplanmış modüller
  const groupedModules = groupModulesByCategory();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
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
          
          <Tooltip title="Bildirimler">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Tema">
            <IconButton color="inherit">
              <BrightnessLowIcon />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Tooltip title="Profil Ayarları">
              <IconButton
                onClick={handleMenuClick}
                sx={{ p: 0 }}
                aria-controls="menu-appbar"
                aria-haspopup="true"
              >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => router.push('/profile')}>Profil</MenuItem>
              <MenuItem onClick={() => router.push('/settings')}>Ayarlar</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Çıkış</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            px: [1],
            backgroundColor: 'primary.main',
            color: 'white'
          }}
        >
          <Typography variant="h6" sx={{ ml: 1 }}>
            Flax-ERP
          </Typography>
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        
        {/* Kullanıcı bilgisi */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}>
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.main', 
              width: 64, 
              height: 64, 
              mb: 1 
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.roles?.includes('admin') ? 'Yönetici' : 'Kullanıcı'}
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Ana Menü */}
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              selected={router.pathname === '/dashboard'}
              onClick={() => router.push('/dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Ana Sayfa" />
            </ListItemButton>
          </ListItem>
          
          {/* Kategorilere göre modül grupları */}
          {Object.entries(groupedModules).map(([category, modules]) => (
            <Box key={category}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleSubMenuToggle(category)}>
                  <ListItemText 
                    primary={category} 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        color: 'text.secondary'
                      } 
                    }} 
                  />
                  {openSubMenu[category] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              
              <Collapse in={openSubMenu[category] ?? true} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {modules.map((module) => (
                    module.code !== 'core' && (
                      <ListItem key={module.id} disablePadding>
                        <ListItemButton 
                          sx={{ pl: 4 }}
                          disabled={!module.isActive}
                          selected={router.pathname.startsWith(module.route)}
                          onClick={() => handleModuleClick(module)}
                        >
                          <ListItemIcon>
                            <ModuleIcon 
                              iconName={module.icon || 'ExtensionIcon'} 
                              status={module.isActive ? 'active' : 'inactive'}
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={module.name} 
                            sx={{ 
                              '& .MuiTypography-root': { 
                                color: module.isActive ? 'text.primary' : 'text.disabled' 
                              } 
                            }}
                          />
                          {!module.isActive && (
                            <Tooltip title="Devre dışı">
                              <Box 
                                sx={{ 
                                  width: 10, 
                                  height: 10, 
                                  borderRadius: '50%', 
                                  bgcolor: 'grey.400' 
                                }} 
                              />
                            </Tooltip>
                          )}
                        </ListItemButton>
                      </ListItem>
                    )
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
        
        <Divider />
        
        {/* Alt Menü */}
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              selected={router.pathname === '/settings'}
              onClick={() => router.push('/settings')}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Ayarlar" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              selected={router.pathname === '/settings/modules'}
              onClick={() => router.push('/settings/modules')}
            >
              <ListItemIcon>
                <ExtensionIcon />
              </ListItemIcon>
              <ListItemText primary="Modül Yönetimi" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Çıkış" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      
      {/* Ana İçerik */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          mt: { xs: '64px' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
