import { createSlice } from '@reduxjs/toolkit'
import { INIT_STATE } from "../State"

const tabSlice = createSlice({
    name: 'tab',
    initialState: INIT_STATE,
    reducers: {
        setTabInstance: (state, action) => { state.tabInstance = action.payload },
        incrementTabCount: (state) => { 
            state.tabCount += 1

            let {openTabIDs} = state.tabInstance.getData()
            state.openedTab = openTabIDs.map(id => Number(id))
        },
        decrementTabCount: (state) => {
            state.tabCount -= 1
        },
        resetTabCount: (state) => { state.tabCount = 1 }
    }
})

const { actions, reducer } = tabSlice

export const { 
    setTabInstance,
    incrementTabCount,
    decrementTabCount
} = actions

export default reducer