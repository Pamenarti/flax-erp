import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Paper, Card, CardContent, CardActions,
  Button, IconButton, AppBar, Toolbar, Grid, Switch, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel,
  Tooltip, Divider, Alert, List, ListItem, ListItemText, ListItemIcon,
  ListItemSecondaryAction, CircularProgress, Snackbar, Avatar
} from '@mui/material';
import { useRouter } from 'next/router';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import ExtensionIcon from '@mui/icons-material/Extension';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import api from '../../config/api';

// İkon bileşeni
const ModuleIcon = ({ iconName }) => {
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

// Modül kart bileşeni
const ModuleCard = ({ module, onToggle, onEdit, onInfo, onDelete }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderLeft: module.isActive ? '4px solid #4caf50' : '4px solid #f44336',
        position: 'relative'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: module.isActive ? 'success.light' : 'error.light',
              mr: 2
            }}
          >
            <ModuleIcon iconName={module.icon} />
          </Avatar>
          <Typography variant="h6">{module.name}</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {module.description || 'Açıklama bulunmuyor'}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {module.isCore && (
            <Chip 
              label="Çekirdek" 
              size="small" 
              color="primary"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          <Chip 
            label={module.isActive ? 'Aktif' : 'Pasif'} 
            size="small" 
            color={module.isActive ? 'success' : 'error'}
            sx={{ mr: 1, mb: 1 }}
          />
          {module.category && (
            <Chip 
              label={module.category} 
              size="small" 
              variant="outlined"
              sx={{ mb: 1 }}
            />
          )}
        </Box>
        
        <Typography variant="caption" display="block" color="text.secondary">
          Kod: {module.code} | Sürüm: {module.version || '1.0.0'}
        </Typography>
        {module.route && (
          <Typography variant="caption" display="block" color="text.secondary">
            Rota: {module.route}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<InfoIcon />}
          onClick={() => onInfo(module)}
        >
          Detaylar
        </Button>
        
        {!module.isCore && (
          <Button 
            size="small" 
            startIcon={<EditIcon />}
            onClick={() => onEdit(module)}
          >
            Düzenle
          </Button>
        )}
        
        <Button 
          size="small" 
          color={module.isActive ? 'error' : 'success'}
          onClick={() => onToggle(module)}
          disabled={module.isCore && module.isActive} // Çekirdek ve aktifse devre dışı bırakılamaz
        >
          {module.isActive ? 'Devre Dışı Bırak' : 'Etkinleştir'}
        </Button>
        
        {!module.isCore && (
          <Button 
            size="small" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(module)}
          >
            Sil
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default function ModuleSettings() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [dialogType, setDialogType] = useState('add'); // add, edit, delete, info
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    icon: 'ExtensionIcon',
    category: 'Operasyon',
    route: '',
    order: 0,
    dependencies: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const router = useRouter();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/modules');
      
      // Modülleri kategoriye göre grupla
      const groupedModules = response.data.reduce((acc, module) => {
        const category = module.category || 'Diğer';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(module);
        return acc;
      }, {});
      
      // Sonucu ayarla
      setModules(groupedModules);
      setLoading(false);
    } catch (error) {
      console.error('Modüller yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Modüller yüklenirken hata oluştu',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, module = null) => {
    setDialogType(type);
    setSelectedModule(module);
    
    if (type === 'add') {
      setFormData({
        code: '',
        name: '',
        description: '',
        icon: 'ExtensionIcon',
        category: 'Operasyon',
        route: '',
        order: 0,
        dependencies: []
      });
    } else if (type === 'edit' && module) {
      setFormData({
        code: module.code,
        name: module.name,
        description: module.description || '',
        icon: module.icon || 'ExtensionIcon',
        category: module.category || 'Operasyon',
        route: module.route || '',
        order: module.order || 0,
        dependencies: module.dependencies || []
      });
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedModule(null);
  };

  const handleToggleModule = async (module) => {
    try {
      // Modülü etkinleştir/devre dışı bırak
      await api.put(`/modules/${module.id}/toggle`, {
        isActive: !module.isActive
      });
      
      // Başarılı mesajı göster
      setSnackbar({
        open: true,
        message: module.isActive 
          ? `${module.name} modülü devre dışı bırakıldı` 
          : `${module.name} modülü etkinleştirildi`,
        severity: 'success'
      });
      
      // Modülleri yeniden yükle
      fetchModules();
    } catch (error) {
      console.error('Modül durumu değiştirilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Modül durumu değiştirilemedi',
        severity: 'error'
      });
    }
  };

  const handleDeleteModule = async () => {
    if (!selectedModule) return;
    
    try {
      await api.delete(`/modules/${selectedModule.id}`);
      
      setSnackbar({
        open: true,
        message: `${selectedModule.name} modülü silindi`,
        severity: 'success'
      });
      
      handleCloseDialog();
      fetchModules();
    } catch (error) {
      console.error('Modül silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Modül silinemedi',
        severity: 'error'
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (dialogType === 'add') {
        await api.post('/modules', formData);
        setSnackbar({
          open: true,
          message: 'Yeni modül başarıyla eklendi',
          severity: 'success'
        });
      } else if (dialogType === 'edit') {
        await api.put(`/modules/${selectedModule.id}`, formData);
        setSnackbar({
          open: true,
          message: 'Modül başarıyla güncellendi',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchModules();
    } catch (error) {
      console.error('Modül kaydedilirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Modül kaydedilemedi',
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Modülleri kategoriye göre değil, kart görünümünde göstermek için düzenleme
  const renderModuleCards = () => {
    const allModules = [];
    Object.values(modules).forEach(categoryModules => {
      allModules.push(...categoryModules);
    });

    return (
      <Grid container spacing={3}>
        {allModules.map(module => (
          <Grid item xs={12} sm={6} md={4} key={module.id}>
            <ModuleCard 
              module={module}
              onToggle={handleToggleModule}
              onEdit={(module) => handleOpenDialog('edit', module)}
              onInfo={(module) => handleOpenDialog('info', module)}
              onDelete={(module) => handleOpenDialog('delete', module)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
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
            Modül Yönetimi
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/settings')}
          >
            Ayarlara Dön
          </Button>
          <Button 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Yeni Modül
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            <ExtensionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Modül Yönetimi
          </Typography>
          <Typography variant="body1" paragraph>
            Flax-ERP sisteminin modüllerini bu sayfadan yönetebilirsiniz. 
            İhtiyacınıza göre modülleri etkinleştirebilir veya devre dışı bırakabilirsiniz.
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1">
              <strong>Önemli:</strong> Modüller, etkinleştirilmeden kullanılamaz. Etkinleştirilmeyen modüllere erişim engellenmiştir.
            </Typography>
          </Alert>
          <Alert severity="info" sx={{ mb: 3 }}>
            Çekirdek modüller sistemin çalışması için gereklidir ve devre dışı bırakılamaz.
          </Alert>
        </Paper>
        
        {/* Modül kartları veya listeleri*/}
        <Paper sx={{ p: 3 }}>
          {/* İsterseniz burada tab menü ekleyebilirsiniz */}
          {Object.keys(modules).length === 0 ? (
            <Alert severity="info">
              Şu anda hiç modül bulunmuyor. Yeni modül eklemek için "Yeni Modül" butonunu kullanabilirsiniz.
            </Alert>
          ) : (
            renderModuleCards()
          )}
        </Paper>
      </Container>

      {/* Diyalog pencereleri */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {dialogType === 'delete' && (
          <>
            <DialogTitle>Modülü Sil</DialogTitle>
            <DialogContent>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>{selectedModule?.name}</strong> modülünü silmek istediğinizden emin misiniz?
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Bu işlem geri alınamaz ve modüle ait tüm veriler silinecektir.
                </Typography>
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>İptal</Button>
              <Button onClick={handleDeleteModule} color="error" variant="contained">
                Sil
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === 'info' && (
          <>
            <DialogTitle>Modül Bilgisi</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Modül Adı:</Typography>
                  <Typography variant="body1">{selectedModule?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Kod:</Typography>
                  <Typography variant="body1">{selectedModule?.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Kategori:</Typography>
                  <Typography variant="body1">{selectedModule?.category || 'Belirtilmemiş'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Sürüm:</Typography>
                  <Typography variant="body1">{selectedModule?.version || '1.0.0'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Durum:</Typography>
                  <Chip 
                    label={selectedModule?.isActive ? 'Aktif' : 'Pasif'} 
                    color={selectedModule?.isActive ? 'success' : 'default'} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Çekirdek Modül:</Typography>
                  <Chip 
                    label={selectedModule?.isCore ? 'Evet' : 'Hayır'} 
                    color={selectedModule?.isCore ? 'primary' : 'default'} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Açıklama:</Typography>
                  <Typography variant="body1">{selectedModule?.description || 'Açıklama bulunmuyor'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Rota:</Typography>
                  <Typography variant="body1">{selectedModule?.route || 'Belirtilmemiş'}</Typography>
                </Grid>
                {selectedModule?.dependencies && selectedModule.dependencies.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Bağımlılıklar:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedModule.dependencies.map(dep => (
                        <Chip key={dep} label={dep} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Kapat</Button>
            </DialogActions>
          </>
        )}

        {(dialogType === 'add' || dialogType === 'edit') && (
          <>
            <DialogTitle>{dialogType === 'add' ? 'Yeni Modül Ekle' : 'Modülü Düzenle'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Modül Adı"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Kod"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={dialogType === 'edit'}
                    helperText={dialogType === 'edit' ? 'Kod düzenlenemez' : 'Benzersiz kod (örn: sales, inventory)'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Açıklama"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="İkon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    fullWidth
                    helperText="İkon adı (örn: InventoryIcon, PeopleIcon)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Kategori"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    fullWidth
                    helperText="Modül kategorisi (örn: Operasyon, Finans)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rota"
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    fullWidth
                    helperText="Modül rota yolu (örn: /inventory, /sales)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Sıralama"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    helperText="Görüntüleme sırası"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>İptal</Button>
              <Button onClick={handleSubmit} variant="contained">
                {dialogType === 'add' ? 'Ekle' : 'Güncelle'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
}
