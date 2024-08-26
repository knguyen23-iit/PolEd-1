import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Route, Routes } from 'react-router-dom'
import AddFilter from './AddFilter'
import Polaroid from './Polaroid'
import Home from './Home'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/add-filter' element={<AddFilter />} />
      <Route path='/polaroid' element={<Polaroid />} />
    </Routes>
  )
}

export default App
