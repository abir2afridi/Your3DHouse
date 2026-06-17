import { Analytics } from "@vercel/analytics/react"

import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { StrictMode, Suspense, useState } from 'react'

import Loader from './Components/Loader.jsx'
import Header from './Components/Header.jsx'
import App from './App.jsx'
import './index.css'

const isMobile = () => {
    return ( ( window.innerWidth <= 1000 ) && ( window.innerHeight <= 800 ) );
  }

const root = ReactDOM.createRoot(document.querySelector('#root'))

const fovForMobile = 100
const fovForPc = 45

function Root() {
  const [mode, setMode] = useState('auto')

  return (
    <StrictMode>
      <Header />
      <Canvas
          camera={{
          fov: isMobile() ? fovForMobile : fovForPc,
          near: 0.1,
          far: 200,
          position: [52, 7, 12],
      }}
      >
          <Suspense fallback={<Loader/>}>
              <App mode={mode} onModeChange={setMode} />   
          </Suspense>
      </Canvas>

      <Analytics/>
      <div style={{ display: "none" }}>
  <section aria-hidden="true">
    <h1>Abir's House - Creative Developer</h1>
    <h2>Computer Science Student at Bordeaux University</h2>
    <h2>Three.js and React Three Fiber Expert</h2>
    <h2>Specialized in 3D Web Development</h2>
  </section>
  <section aria-hidden="true">
    <h2>Skills and Expertise</h2>
    <ul>
      <li>Three.js Developer</li>
      <li>React Three Fiber Developer</li>
      <li>GSAP Developer</li>
      <li>3D Web Experiences</li>
      <li>Creative Coding</li>
    </ul>
  </section>
  <section aria-hidden="true">
    <p>
      Welcome to the 3D portfolio of Abir. This immersive portfolio has 
      been created using React Three Fiber and GSAP, with custom 3D models designed 
      in Blender. Explore innovative web experiences that blend creativity and technology.
    </p>
  </section>
  <noscript>
    <p>
      This 3D portfolio of Abir showcases creative web development using 
      React Three Fiber, Three.js, and GSAP. Please enable JavaScript to explore 
      the immersive experience.
    </p>
  </noscript>
</div>



    </StrictMode>
  )
}

root.render(<Root />)
