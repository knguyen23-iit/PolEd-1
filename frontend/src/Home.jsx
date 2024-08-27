import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <Link to={`/add-filter`}>
        <button>Step 1: Add Filter</button>
      </Link>
      <Link to={`/polaroid`}>
        <button>Step 2: Polaroid</button>
      </Link>
    </div>
  )
}

export default Home
