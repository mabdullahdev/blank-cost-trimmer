import React, { useEffect } from 'react'

// Components
import Tab from '../components/Tab/Tab';

import { Box } from '@mui/material';

// Styles
import {  makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    boxModel: {
        margin: '25px 0px 0px 0px',
        padding: '10px',
        minHeight: 'calc(100% - 150px)'
    }
}));

const Home = () => {
    const classes = useStyles()

    useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Box
                className={classes.boxModel}
            >
                <Tab />
            </Box>
        </>
    )
}

export default Home