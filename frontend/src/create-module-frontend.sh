#!/bin/bash

MODULE_NAME=$1
MODULE_CODE=$2
MODULE_ROUTE=$3
MODULE_ICON="${4:-ExtensionIcon}"

if [ -z "$MODULE_NAME" ] || [ -z "$MODULE_CODE" ] || [ -z "$MODULE_ROUTE" ]; then
  echo "Usage: ./create-module-frontend.sh \"Module Name\" module-code /route-path [IconName]"
  exit 1
fi

# Klasör yapısını oluştur
mkdir -p src/modules/$MODULE_CODE
mkdir -p src/modules/$MODULE_CODE/components
mkdir -p src/modules/$MODULE_CODE/pages
mkdir -p src/modules/$MODULE_CODE/hooks
mkdir -p src/modules/$MODULE_CODE/utils
mkdir -p src/pages/$MODULE_ROUTE

# Ana sayfa dosyası
cat > src/pages/$MODULE_ROUTE/index.js << EOF
import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, CircularProgress,
  AppBar, Toolbar, IconButton, Button
} from '@mui/material';
import { useRouter } from 'next/router';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import $MODULE_ICON from '@mui/icons-material/$MODULE_ICON';
import api from '../../config/api';
import ModuleGuard from '../../components/ModuleGuard';
import ${MODULE_NAME}List from '../../modules/${MODULE_CODE}/components/${MODULE_NAME}List';

// Ana bileşen
function ${MODULE_NAME}Content() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/${MODULE_ROUTE}');
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Veriler yüklenirken bir hata oluştu.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            ${MODULE_NAME}
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={() => router.push('${MODULE_ROUTE}/new')}
          >
            Yeni Ekle
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <$MODULE_ICON sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="div">
              ${MODULE_NAME} Yönetimi
            </Typography>
          </Box>
          
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <${MODULE_NAME}List data={data} />
          )}
        </Paper>
      </Container>
    </Box>
  );
}

// ModuleGuard ile sarmala ve export et
export default function ${MODULE_NAME}WithGuard() {
  return (
    <ModuleGuard moduleCode="${MODULE_CODE}">
      <${MODULE_NAME}Content />
    </ModuleGuard>
  );
}
EOF

# List bileşeni
cat > src/modules/$MODULE_CODE/components/${MODULE_NAME}List.js << EOF
import { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';

export default function ${MODULE_NAME}List({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const router = useRouter();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    router.push(\`${MODULE_ROUTE}/edit/\${id}\`);
  };

  const handleDelete = (id) => {
    // TODO: Silme işlemi
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      console.log('Silinecek ID:', id);
    }
  };

  if (data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Kayıt bulunamadı</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.isActive ? 'Aktif' : 'Pasif'} 
                      color={item.isActive ? 'success' : 'default'}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(item.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteIcon fontSize="small" />
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
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
EOF

echo "Frontend modül yapısı oluşturuldu."
echo "Klasörler ve dosyalar şuraya oluşturuldu:"
echo "- src/modules/$MODULE_CODE"
echo "- src/pages/$MODULE_ROUTE"
