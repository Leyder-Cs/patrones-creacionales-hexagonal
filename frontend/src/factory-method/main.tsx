import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import '../navigation.css'
import PatternPage from '../components/PatternPage'
import ProductList from '../components/ProductList'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PatternPage>
      <ProductList />
    </PatternPage>
  </StrictMode>,
)
