import { combineReducers, applyMiddleware } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import thunk from "redux-thunk"
import { composeWithDevTools } from 'redux-devtools-extension'

import TabReducer from './slices/Tab.Slice'
import MediaReducer from './slices/Media.Slice'
import ParamReducer from './slices/Param.Slice'

const Store = configureStore(
    {
        reducer: {
            tab: TabReducer,
            media: MediaReducer,
            param: ParamReducer
        },
        middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['tab/setTabInstance'],
                // Ignore these field paths in all actions
                ignoredActionPaths: [],
                // Ignore these paths in the state
                ignoredPaths: [],
            },
        }),
    }
)

export default Store