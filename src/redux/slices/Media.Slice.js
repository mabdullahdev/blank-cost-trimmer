import { createSlice } from '@reduxjs/toolkit'
import { INIT_STATE } from "../State"

const mediaSlice = createSlice({
    name: 'media',
    initialState: INIT_STATE,
    reducers: {
        setMedia: (state, action) => { state.uploadedMedia = action.payload }
    }
})

const { actions, reducer } = mediaSlice

export const {
    setMedia
} = actions

export default reducer