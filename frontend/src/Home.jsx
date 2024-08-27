import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import './Home.css'

function Home() {
  return (
    <div>
      <div className='button-container'>
        <Link to={`/add-filter`}>
          <Button variant='contained'>Step 1: Add Filter</Button>
        </Link>
        <Link to={`/polaroid`}>
          <Button variant='contained'>Step 2: Polaroid</Button>
        </Link>
      </div>
      <div className="logo-container">
        <img
          src="blueing.jpg" // Replace with the URL of your image
          alt="Rotating"
          className="rotating-image"
        />
      </div>
    </div>
  )
}

export default Home
