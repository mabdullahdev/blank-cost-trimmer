import { useState, useEffect } from 'react'

const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window

    return {
        width,
        height
    }
}

const UseWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions(getWindowDimensions())
        }

        // Add Event Listeners
        window.addEventListener('resize', handleResize)

        // Remove Listeners
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}

export default UseWindowDimensions