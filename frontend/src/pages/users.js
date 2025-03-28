import { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, Alert,
  Snackbar, AppBar, Toolbar, CircularProgress, TablePagination,
  Avatar
} from '@mui/material';
import { useRouter } from 'next/router';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import api from '../config/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' veya 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roles: ['user']
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const router = useRouter();

  // Kullanıcı verilerini al
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Kullanıcılar alınamadı:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcılar yüklenirken bir hata oluştu',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleDialogOpen = (mode, user = null) => {
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',  // Güvenlik nedeniyle boş bırakıyoruz
        roles: user.roles
      });
      setCurrentUser(user);
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        roles: ['user']
      });
      setCurrentUser(null);
    }
    
    setDialogMode(mode);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRolesChange = (e) => {
    setFormData({ ...formData, roles: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await api.post('/users', formData);
        setSnackbar({
          open: true,
          message: 'Kullanıcı başarıyla eklendi',
          severity: 'success'
        });
      } else {
        // Şifre alanı boşsa API'ye gönderme
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        await api.put(`/users/${currentUser.id}`, dataToSend);
        setSnackbar({
          open: true,
          message: 'Kullanıcı başarıyla güncellendi',
          severity: 'success'
        });
      }
      
      handleDialogClose();
      fetchUsers();
    } catch (error) {
      console.error('Kullanıcı kaydedilemedi:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcı kaydedilemedi',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/users/${userId}`);
        setSnackbar({
          open: true,
          message: 'Kullanıcı başarıyla silindi',
          severity: 'success'
        });
        fetchUsers();
      } catch (error) {
        console.error('Kullanıcı silinemedi:', error);
        setSnackbar({
          open: true,
          message: 'Kullanıcı silinemedi',
          severity: 'error'
        });
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      {/* Uygulama Çubuğu */}
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
            Kullanıcı Yönetimi
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen('add')}
          >
            Yeni Kullanıcı
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Kullanıcı Listesi
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Profil</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Ad</TableCell>
                  <TableCell>Soyad</TableCell>
                  <TableCell>Roller</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </Avatar>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>
                        {user.roles.map((role) => (
                          <Chip 
                            key={role}
                            label={role} 
                            size="small" 
                            color={role === 'admin' ? 'primary' : 'default'}
                            sx={{ mr: 0.5 }} 
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Aktif' : 'Pasif'} 
                          color={user.isActive ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleDialogOpen('edit', user)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına satır:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} / ${count}`
            }
          />
        </Paper>
        
        {/* Kullanıcı Ekleme/Düzenleme Diyaloğu */}
        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'add' ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-posta Adresi"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleFormChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
              />
              <TextField
                margin="normal"
                required={dialogMode === 'add'}
                fullWidth
                name="password"
                label="Şifre"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleFormChange}
                helperText={dialogMode === 'edit' ? "Değiştirmek istemiyorsanız boş bırakın" : ""}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="roles-label">Roller</InputLabel>
                <Select
                  labelId="roles-label"
                  id="roles"
                  multiple
                  value={formData.roles}
                  onChange={handleRolesChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">Kullanıcı</MenuItem>
                  <MenuItem value="manager">Yönetici</MenuItem>
                </Select>
              </FormControl>
              
              {dialogMode === 'edit' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Kullanıcı şifresini değiştirmek istemiyorsanız şifre alanını boş bırakabilirsiniz.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'add' ? 'Ekle' : 'Güncelle'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
