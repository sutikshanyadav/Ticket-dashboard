import React, { useState, useEffect } from 'react';
import { getRecords, addRecord, updateRecord} from '../services/api';
import { 
  Box, Card, CardActions, CardContent, Typography, Chip, Grid, TextField,
  MenuItem, Container, AppBar, Toolbar, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, CircularProgress
} from '@mui/material';
import { Search, Add, Edit } from '@mui/icons-material';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const initialFormValues = {
    SupportUser: '',
    ReportDateTime: '',
    ClientCode: '',
    Module: '',
    FormName: '',
    QuerySubject: '',
    QueryDescription: '',
    QuerySolution: '',
    CurrentStatus: '',
    TodaysStatus: '',
    CallID: '',
    UserName: '',
    MobileNumber: '',
    EmailID: '',
    IsCritical: '',
    TicketID: '',
    DueDate: '',
    CompletedOn: '',
    AccountID: '',
    LicensedTo: '',
    Notes: '',
    MediaName: '',
    Media: '',
    StatusDateTime: '',
    Tags: '',
    IsKnowledgeSharing: '',
  };

  const [formValues, setFormValues] = useState(initialFormValues);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getRecords(); // Simulated API call
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleOpenModal = (record = null) => {
    setSelectedRecord(record);
    setFormValues(record || initialFormValues);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedRecord) {
        // Update an existing record
        await updateRecord(selectedRecord.TicketID, formValues);
        console.log(`Record with TicketID ${selectedRecord.TicketID} updated successfully.`);
      } else {
        // Create a new record
        const newRecord = { ...formValues, TicketID: Date.now().toString() };
        await addRecord(newRecord);
        console.log(`New record with TicketID ${newRecord.TicketID} added successfully.`);
      }
  
      // Reload records from the API
      const response = await getRecords();
      setRecords(response.data);
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      // Close the modal after operation
      handleCloseModal();
    }
  };
  

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.QuerySubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.TicketID?.toString().includes(searchTerm) ||
      record.ClientCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || record.CurrentStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'For Development': 'primary',
      'Service Review Pending': 'warning',
      'Client Review Pending': 'info',
      'Done': 'success',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* AppBar and Toolbar - keeping existing code */}
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Support Tickets
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
            New Ticket
          </Button>
        </Toolbar>
      </AppBar>

      {/* Search and Filter - keeping existing code */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            fullWidth
            placeholder="Search tickets..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            variant="outlined"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="For Development">For Development</MenuItem>
            <MenuItem value="Service Review Pending">Service Review Pending</MenuItem>
            <MenuItem value="Client Review Pending">Client Review Pending</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </TextField>
        </Box>

        {/* Updated Records Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRecords.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.TicketID}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { boxShadow: 3 },
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                        {record.QuerySubject || 'No Subject'}
                      </Typography>
                      <Chip 
                        label={record.CurrentStatus || 'No Status'} 
                        color={getStatusColor(record.CurrentStatus)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography color="textSecondary" sx={{ mb: 1 }}>
                      {record.QueryDescription || 'No description provided'}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Client:</strong> {record.ClientCode || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Ticket ID:</strong> {record.TicketID || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Assigned to:</strong> {record.SupportUser || 'Unassigned'}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          Due: {formatDate(record.DueDate)}
                        </Typography>
                        {record.IsCritical && (
                          <Chip label="Critical" color="error" size="small" />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenModal(record)}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Modal - keeping existing code */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRecord ? 'Edit Ticket' : 'New Ticket'}</DialogTitle>
        <DialogContent>
          {Object.keys(initialFormValues).map((field) => (
            <TextField
              key={field}
              label={field.replace(/([A-Z])/g, ' $1').trim()}
              name={field}
              value={formValues[field]}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              InputLabelProps={field === 'DueDate' ? { shrink: true } : undefined}
              type={field === 'DueDate' ? 'date' : 'text'}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedRecord ? 'Save Changes' : 'Create Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
