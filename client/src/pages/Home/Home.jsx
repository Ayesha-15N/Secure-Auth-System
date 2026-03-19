import React, { useContext } from 'react'
import { assets } from '../../assets/assets.js'
import './Home.css'
import { Context } from '../../components/Context.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Home = () => {
  const { user, setUser, url } = useContext(Context)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post(url + '/api/auth/logout')
      setUser(null)
      toast.success('Logged out successfully')
      navigate('/')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <div className='home'>
      <div className="home-card">

        {/* Avatar */}
        <div className="home-avatar">
          <img src={assets.header_img} alt="avatar" />
        </div>

        {/* Greeting */}
        <div className="hello-text">
          <h3>Hey, {user?.name || 'there'}</h3>
          <img src={assets.hand_wave} alt="wave" />
        </div>

        {/* Verified badge */}
        {user?.isAccountVerified && (
          <span className="verified-badge">✓ Verified</span>
        )}

        <h1>Welcome to AuthApp</h1>
        <p>
          You're successfully logged in. Your account is secure
          and ready to use.
        </p>

        {/* Actions */}
        <div className="home-actions">
          {!user?.isAccountVerified && (
            <button
              type='button'
              className='home-btn verify-btn'
              onClick={() => navigate('/email-verify')}
            >
              Verify Email
            </button>
          )}
          <button
            type='button'
            className='home-btn logout-btn'
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  )
}

export default Home
