import React from 'react'
import PropTypes from 'prop-types';

// MUI Components
import {
    Box,
    Drawer,
    Tabs,
    Tab,
    Typography,
    TextField,
    Stack
} from '@mui/material'


// Contexts
import { useActiveDrawer, useToggleDrawer } from '../../contexts/MenuContext';

const Settings = () => {
    const activeDrawer = useActiveDrawer()
    const toggleDrawer = useToggleDrawer()

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;
      
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    const a11yProps = (index) => {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const SettingTabs = () => {
        const [value, setValue] = React.useState(0);

        const handleChange = (event, newValue) => {
            setValue(newValue);
        };

        return (
            <Box sx={{ width: 350 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={value} 
                        onChange={handleChange}
                    >
                        <Tab label="Parameters" {...a11yProps(0)} />
                        <Tab label="Options" {...a11yProps(1)} />
                    </Tabs>
                </Box>

                {/* Parameters */}
                <TabPanel value={value} index={0}>
                    <Stack
                        spacing={5}
                    >
                        <TextField
                            fullWidth
                            label="Material Utilization"
                            defaultValue="0.01"
                            variant="standard"
                        />

                        <TextField
                            fullWidth
                            label="Number of Points"
                            defaultValue="2500"
                            variant="standard"
                        />

                        <TextField
                            fullWidth
                            label="Incremental Steps"
                            defaultValue="100"
                            variant="standard"
                        />
                    </Stack>
                </TabPanel>

                {/* Options */}
                <TabPanel value={value} index={1}>
                    Item Two
                </TabPanel>
            </Box>
        )
    }

    return (
        <Drawer
            anchor='right'
            open={ activeDrawer }
            onClose={ toggleDrawer }
        >
            <SettingTabs />
        </Drawer>
    )
}

export default Settings