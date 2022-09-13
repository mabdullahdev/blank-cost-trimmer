import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import Store from './redux/Store'

// Context Providers
import  MenuProvider from './contexts/MenuContext'

// Default Layout
import Layout from './layout/Layout'
const App = () => {

    return (
        <>
            <Provider store={ Store }>
                <MenuProvider>
                    <BrowserRouter>
                        <Layout/>
                    </BrowserRouter>
                </MenuProvider>
            </Provider>
        </>
    )
}

export default App