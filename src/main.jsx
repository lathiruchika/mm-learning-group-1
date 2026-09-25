import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// Backend is not yet available; intercept API calls with an in-memory mock
// in dev builds so the app can be exercised end-to-end. Set
// VITE_USE_MOCKS=false once a real backend is running.
const useMocks = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false'

if (useMocks) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' }).finally(renderApp)
  })
} else {
  renderApp()
}
