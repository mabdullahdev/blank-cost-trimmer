import React from 'react'
import { useDispatch } from 'react-redux/'

// Actions
import { 
    setTabInstance,
    decrementTabCount

} from '../../redux/slices/Tab.Slice'

import 'react-dyn-tabs/style/react-dyn-tabs.css'
import 'react-dyn-tabs/themes/react-dyn-tabs-card.css'

import useDynTabs from 'react-dyn-tabs'

// Components
import Canvas from '../Canvas/Canvas'

const Tab = () => {
    const dispatch = useDispatch()

    const options = {
        tabs: [
            {
                id: 1,
                title: 'Canvas 1',
                closable: false,
                panelComponent: (props) => (<Canvas canvasId={ 1 } />)
            }
        ],
        selectedTabID: 1,
        onClose: () => { 
            dispatch(decrementTabCount())
        }
    }

    const [TabList, PanelList, ready] = useDynTabs(options);
    
    ready((instance) => {
        dispatch(setTabInstance(instance))
    }, []);

    return (
        <>
            <TabList></TabList>
            <PanelList></PanelList>
        </>
    )
}

export default Tab