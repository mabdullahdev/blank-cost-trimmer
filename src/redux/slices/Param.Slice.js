import { createSlice } from '@reduxjs/toolkit'
import { INIT_STATE } from "../State"

const paramSlice = createSlice({
    name: 'param',
    initialState: INIT_STATE,
    reducers: {
    }
})

const { reducer } = paramSlice

export default reducer