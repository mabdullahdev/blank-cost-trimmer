import React, { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

// Actions
import { incrementTabCount } from '../../redux/slices/Tab.Slice'
import { setMedia } from '../../redux/slices/Media.Slice';

// MUI Components
import { 
    Box,
    List,
    Divider,
    ListItem,
    ListItemButton,
    ListItemIcon,
    IconButton,
    Tooltip
} from '@mui/material';

// MUI Icons
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CropIcon from '@mui/icons-material/Crop';
import BrushIcon from '@mui/icons-material/Brush';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

// Colors
import { deepOrange } from '@mui/material/colors';

// Styles
import {  makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    listItemIcon: {
        color: deepOrange[900],
        "&:hover": {
            cursor: "pointer",
            color: deepOrange[100],
        }
    },
    listItemText: {
        color: 'white',
    }
}));

const Toolbar = () => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const fileInputRef = useRef(null)

    // Selectors
    const tabInstance = useSelector((state) => state.tab.tabInstance)

    const addCanvas = () => {
        const { openTabIDs } = tabInstance.getData()
        let openedTab = openTabIDs.map(id => Number(id))

        tabInstance.open(
            {
                id: Math.max(...openedTab) + 1,
                title: `Canvas ${ Math.max(...openedTab) + 1 }`,
                panelComponent: (props) => (<p>Panel { Math.max(...openedTab) + 1 }</p>)
            }
        )
        
        // Incrementing tab count
        dispatch(incrementTabCount())
    }

    // Open file dialog
    const openFileDialog = () => {
        fileInputRef.current.click()
    }

    // On file change save it in state
    const handleFileChange = (event) => {
        const fileObj = event.target.files && event.target.files[0];
        
        if (!fileObj) {
            return;
        } else {
            dispatch(setMedia(fileObj))
        }

        // reset file input
        event.target.value = null;
    }

    // Icon List Array
    const icons = [
        {
            text: 'Add Canvas',
            icon: <AddCardRoundedIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Select File',
            icon: <FolderOpenIcon className={classes.listItemIcon} />,
            onClick: () => openFileDialog()
        },
        {
            text: 'Optimize',
            icon: <SettingsSuggestIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Move',
            icon: <OpenWithIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Select',
            icon: <HighlightAltIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Quick Selection',
            icon: <AutoFixHighIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Crop',
            icon: <CropIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Paint',
            icon: <BrushIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Pan',
            icon: <PanToolIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Zoom In',
            icon: <ZoomInIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
        {
            text: 'Zoom Out',
            icon: <ZoomOutIcon className={classes.listItemIcon} />,
            onClick: () => addCanvas()
        },
    ]

    // Icon List Component
    const list = () => (
        <Box>
            <List>
                {
                    icons.map((icon, index) => (
                        <ListItem 
                            key={index} 
                            disablePadding
                        >
                            <ListItemButton
                                onClick={ icon.onClick }
                            >
                                <ListItemIcon>
                                    <Tooltip title={icon.text} placement='top'>
                                        <IconButton>
                                            { icon.icon }
                                        </IconButton>
                                    </Tooltip>
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
        </Box>
    )

    const FileInput = (props) => {
        return (
            <input 
                style={{
                    display: 'none'
                }}
                ref={props.fileInputRef}
                type='file'
                onChange={handleFileChange}
            />
        )
    }

    return (
        <>
            <Divider />

            { list() }

            {/* Hidden File Input */}
            <FileInput fileInputRef={fileInputRef} />
        </>
    )
}

export default Toolbar