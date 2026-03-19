import React from 'react'
import { assets } from '../../assets/assets.js'
import './Navbar.css'
const Navbar = () => {
  return (
    <div className='navbar flex items-center justify-between gap-4 py-2'>
        <div className="nav-left flex items-center justify-center">
            <div className="logo">
            <img src={assets.logo2} className='w-[100%] h-[100%] object-cover pt-[5px]' alt="" />
            </div>           
            <h3 className='font-bold text-[var(--text-color)]'>Auth</h3>
        </div>
        {/* <div className="nav-right border-2 border-[var(--text-color)] py-2 px-5 rounded-full cursor-pointer hover:bg-[var(--hover-color)] ">
            <button className='login-btn flex items-center justify-center gap-2' type="button"><span className='text-[var(--text-color)]'>Login</span><img src={assets.arrow_icon} alt="" /></button>
        </div> */}
      
    </div>
  )
}

export default Navbar
