import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

interface TrainingSidebarContentProps {
  onNavigate?: () => void;
}

const externalItems = [
  { title: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
  { title: 'Classes', icon: <PeopleOutlinedIcon fontSize="small" /> },
  { title: 'Registration', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { title: 'Exams', icon: <SchoolOutlinedIcon fontSize="small" /> },
];

const TrainingSidebarContent: React.FC<TrainingSidebarContentProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTraining = location.pathname.startsWith('/training') || location.pathname === '/';
  const [trainingOpen, setTrainingOpen] = useState(isTraining);

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const activeSx = {
    bgcolor: 'rgba(255,255,255,0.12)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
  };

  const inactiveSx = {
    opacity: 0.55,
    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', opacity: 0.8 },
  };

  return (
    <List component="nav" dense disablePadding sx={{ pt: 0.5 }}>
      {externalItems.map((item) => (
        <ListItemButton key={item.title} disabled sx={inactiveSx}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '0.85rem' }} />
        </ListItemButton>
      ))}

      {/* Training section */}
      <ListItemButton
        onClick={() => setTrainingOpen(!trainingOpen)}
        sx={{
          color: '#fff',
          ...(isTraining ? { bgcolor: 'rgba(255,255,255,0.08)' } : {}),
          '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
          <OndemandVideoOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Training" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
        {trainingOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </ListItemButton>

      <Collapse in={trainingOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding dense>
          <ListItemButton
            sx={{
              pl: 6,
              color: '#fff',
              ...(isActive('/training', true) || isActive('/', true) ? activeSx : { opacity: 0.7, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', opacity: 1 } }),
            }}
            onClick={() => handleNav('/training')}
          >
            <ListItemText primary="Videos" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
          <ListItemButton
            sx={{
              pl: 6,
              color: '#fff',
              ...(isActive('/training/admin') ? activeSx : { opacity: 0.7, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', opacity: 1 } }),
            }}
            onClick={() => handleNav('/training/admin')}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 28 }}>
              <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText primary="Admin" primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItemButton>
        </List>
      </Collapse>

      {/* Settings placeholder */}
      <ListItemButton disabled sx={inactiveSx}>
        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
          <SettingsOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.85rem' }} />
      </ListItemButton>
    </List>
  );
};

export default TrainingSidebarContent;
