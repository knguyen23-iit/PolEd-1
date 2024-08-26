import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      <Link to={`/polaroid`}>
        <button>Polaroid</button>
      </Link>
      <Link to={`/add-filter`}>
        <button>Add Filter</button>
      </Link>
    </div>
  )
}

export default Home
