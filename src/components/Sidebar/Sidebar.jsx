import React from 'react'
import Logo from '../../logo.png'
import './Sidebar.css'

// Components
import Toolbar from '../Toolbar/Toolbar'

// MUI Components
import { Box } from '@mui/material'

const Sidebar = () => {
    return (
        <>
            {/* Logo */}
            {/* <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <img src={Logo} alt="Blank Cost Trimmer" />
            </Box> */}

            {/* Toolbar */}
            <div className="scroll-sidebar">
                <Toolbar />
            </div>
        </>
    )
}

export default Sidebar