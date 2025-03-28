import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, Card, CardContent, 
  Button, AppBar, Toolbar, IconButton, Tabs, Tab, 
  InputAdornment, TextField, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  CircularProgress, Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../../config/api';
import ModuleGuard from '../../components/ModuleGuard';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Inventory() {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Load initial data
        const [
          productsResponse, 
          lowStockResponse, 
          categoriesResponse, 
          movementsResponse
        ] = await Promise.all([
          api.get('/products'),
          api.get('/products/low-stock'),
          api.get('/products/categories'),
          api.get('/stock-movements')
        ]);

        setProducts(productsResponse.data);
        setLowStockProducts(lowStockResponse.data);
        setCategories(categoriesResponse.data);
        setStockMovements(movementsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading inventory data:", err);
        setError("Stok verileri yüklenirken bir hata oluştu.");
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/search?name=${searchTerm}`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setError("Arama sırasında bir hata oluştu.");
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddProduct = () => {
    router.push('/inventory/products/new');
  };

  const handleEditProduct = (id) => {
    router.push(`/inventory/products/edit/${id}`);
  };

  const handleAddStockMovement = () => {
    router.push('/inventory/movements/new');
  };

  const handleProductDetails = (id) => {
    router.push(`/inventory/products/${id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        setError("Ürün silinirken bir hata oluştu.");
      }
    }
  };

  const getStockStatusChip = (product) => {
    if (product.currentStock <= 0) {
      return <Chip label="Stokta Yok" color="error" size="small" />;
    } else if (product.currentStock <= product.minimumStockLevel) {
      return <Chip label="Düşük Stok" color="warning" size="small" />;
    } else {
      return <Chip label="Stokta Var" color="success" size="small" />;
    }
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
      {/* Header */}
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
            Stok Yönetimi
          </Typography>
          <Button color="inherit" startIcon={<AddIcon />} onClick={handleAddProduct}>
            Yeni Ürün
          </Button>
          <Button color="inherit" startIcon={<ReceiptIcon />} onClick={handleAddStockMovement}>
            Stok Hareketi
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Toplam Ürün
                </Typography>
                <Typography variant="h4" component="div">
                  {products.length}
                </Typography>
                <InventoryIcon sx={{ color: 'primary.main', position: 'absolute', right: 20, top: 20 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Düşük Stokta
                </Typography>
                <Typography variant="h4" component="div">
                  {lowStockProducts.length}
                </Typography>
                <WarningIcon sx={{ color: 'warning.main', position: 'absolute', right: 20, top: 20 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Kategoriler
                </Typography>
                <Typography variant="h4" component="div">
                  {categories.length}
                </Typography>
                <CategoryIcon sx={{ color: 'info.main', position: 'absolute', right: 20, top: 20 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Stok Hareketleri
                </Typography>
                <Typography variant="h4" component="div">
                  {stockMovements.length}
                </Typography>
                <AssessmentIcon sx={{ color: 'success.main', position: 'absolute', right: 20, top: 20 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ürün Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleSearch}
                disabled={searchTerm.trim() === ''}
              >
                Ara
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ width: '100%', mb: 3 }}>
          <AppBar position="static" color="default" elevation={0}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Tüm Ürünler" />
              <Tab label="Düşük Stok" />
              <Tab label="Stok Hareketleri" />
            </Tabs>
          </AppBar>

          {/* All Products Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kod</TableCell>
                    <TableCell>Adı</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="right">Satış Fiyatı</TableCell>
                    <TableCell align="right">Stok Miktarı</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.code}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              cursor: 'pointer' 
                            }}
                            onClick={() => handleProductDetails(product.id)}
                          >
                            {product.name}
                          </Box>
                        </TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell align="right">₺{product.salePrice?.toFixed(2)}</TableCell>
                        <TableCell align="right">{product.currentStock} {product.unit}</TableCell>
                        <TableCell>{getStockStatusChip(product)}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Ürün bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={products.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına satır:"
            />
          </TabPanel>

          {/* Low Stock Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kod</TableCell>
                    <TableCell>Adı</TableCell>
                    <TableCell align="right">Mevcut Stok</TableCell>
                    <TableCell align="right">Minimum Seviye</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.currentStock} {product.unit}</TableCell>
                      <TableCell align="right">{product.minimumStockLevel} {product.unit}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={<WarningIcon />} 
                          label="Düşük Stok" 
                          color="warning" 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => router.push('/inventory/movements/new?productId=' + product.id)}
                        >
                          Stok Ekle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Düşük stok seviyesinde ürün bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Stock Movements Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Hareket Türü</TableCell>
                    <TableCell align="right">Miktar</TableCell>
                    <TableCell>Belge No</TableCell>
                    <TableCell>Notlar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stockMovements.slice(0, 10).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                      <TableCell>{movement.product?.name}</TableCell>
                      <TableCell>
                        {movement.movementType === 'purchase' && 'Satın Alma'}
                        {movement.movementType === 'sale' && 'Satış'}
                        {movement.movementType === 'adjust' && 'Stok Ayarlama'}
                        {movement.movementType === 'return' && 'İade'}
                        {movement.movementType === 'transfer' && 'Transfer'}
                        {movement.movementType === 'initial' && 'Açılış'}
                      </TableCell>
                      <TableCell align="right">{movement.quantity} {movement.product?.unit}</TableCell>
                      <TableCell>{movement.documentNumber || '-'}</TableCell>
                      <TableCell>{movement.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {stockMovements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Stok hareketi bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => router.push('/inventory/movements')} 
                variant="outlined"
              >
                Tüm Hareketleri Görüntüle
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}

// ModuleGuard ile sarmala ve export et
export default function InventoryWithGuard() {
  return (
    <ModuleGuard moduleCode="inventory">
      <Inventory />
    </ModuleGuard>
  );
}
