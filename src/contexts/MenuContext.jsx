import React, { useState, useContext, createContext } from "react";

const MenuContext = createContext()
const MenuToggleContext = createContext()

const DrawerContext = createContext()
const DrawerToggleContext = createContext()


// Menu Hooks
export const useActiveMenu = () => {
    return useContext(MenuContext)
}

export const useToggleMenu = () => {
    return useContext(MenuToggleContext)
}

// Drawer Hooks
export const useActiveDrawer = () => {
    return useContext(DrawerContext)
}

export const useToggleDrawer = () => {
    return useContext(DrawerToggleContext)
}

const MenuProvider = (props) => {
    const [activeDrawer, setActiveDrawer] = useState(false)
    const [activeMenu, setActiveMenu] = useState(true)

    function toggleMenu () {
        setActiveMenu(activeMenu => !activeMenu)
    }

    function toggleDrawer () {
        setActiveDrawer(activeDrawer => !activeDrawer)
    }


    return (
        <>
            <MenuContext.Provider value={ activeMenu }>
                <MenuToggleContext.Provider value={ toggleMenu }>
                    <DrawerContext.Provider value={ activeDrawer }>
                        <DrawerToggleContext.Provider value={ toggleDrawer }>
                            { props.children }
                        </DrawerToggleContext.Provider>
                    </DrawerContext.Provider>
                </MenuToggleContext.Provider>
            </MenuContext.Provider>
        </>
    );
}

export default MenuProvider