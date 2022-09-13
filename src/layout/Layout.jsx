import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Contexts
import { 
    useActiveMenu,
    useToggleDrawer
} from '../contexts/MenuContext'

// Pages
import Home from '../pages/Home'

// Components
import Navbar from '../components/Navbar/Navbar'
import Settings from '../components/Settings/Settings'
import Sidebar from '../components/Sidebar/Sidebar'

// Material Color Palette Imports
import { 
    grey,
    deepOrange
} from '@mui/material/colors'

// Material Component Imports
import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab';

// MUI Icons
import SettingsIcon from '@mui/icons-material/Settings';

// Styles
import {  makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    drawerFab: {
        "&:hover": {
            cursor: "pointer",
            "& $settingIcon": {
                color: 'orange'
            }
        }
    },
    settingIcon: () => ({
        color: 'grey'
    })
}));

const Layout = () => {
    const toggleDrawer = useToggleDrawer()
    const activeMenu = useActiveMenu()
    const classes = useStyles()

    return (
        <Box
            sx={{ 
                display: 'flex',
                position: 'relative',
                height: '100vh',
            }}
        >
            {/* Sidebar */}
            {
                activeMenu && (
                    <Box
                        sx={{
                            width: '5rem',
                            position: 'fixed',
                            backgroundColor: deepOrange[400],
                            height: '100%',
                        }}
                    >
                        {/* Sidebar */}
                        <Sidebar />
                    </Box>
                )
            }

            {/* Main Content */}
            <Box
                sx={{
                    marginLeft: activeMenu ? '5rem' : '0px',
                    width: '100%',
                    height: '100%',
                }}
            >
                
                <Navbar />

                <Routes>
                    <Route 
                        path="/"
                        element={<Home />}
                    />
                </Routes>

                <Settings />
            </Box>

            {/* Floating Drawer Icon */}
            <Fab 
                className={classes.drawerFab} 
                sx={{ position: 'absolute', bottom: '15px', right: '15px' }} 
                aria-label="Options"
                onClick={ toggleDrawer }
            >
                <SettingsIcon className={classes.settingIcon} />
            </Fab>
        </Box>
    )
}

export default Layout
