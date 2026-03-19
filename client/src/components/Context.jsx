import React, { createContext, useState } from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true

export const Context = createContext()

const ContextProvider = (props) => {

  const url = import.meta.env.VITE_API_URL || "http://localhost:4000"
  const [user,setUser] = useState(null)
  const contextValue = {
    url,
    user,
    setUser
  }

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  )
}

export default ContextProvider