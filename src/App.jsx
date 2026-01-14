import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import RelativeValuation from './pages/RelativeValuation'
import AbsoluteValuation from './pages/AbsoluteValuation'
import PECalculator from './pages/calculators/PECalculator'
import PBCalculator from './pages/calculators/PBCalculator'
import PSCalculator from './pages/calculators/PSCalculator'
import PEGCalculator from './pages/calculators/PEGCalculator'
import DCFCalculator from './pages/calculators/DCFCalculator'
import DDMCalculator from './pages/calculators/DDMCalculator'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="relative" element={<RelativeValuation />} />
          <Route path="relative/pe" element={<PECalculator />} />
          <Route path="relative/pb" element={<PBCalculator />} />
          <Route path="relative/ps" element={<PSCalculator />} />
          <Route path="relative/peg" element={<PEGCalculator />} />
          <Route path="absolute" element={<AbsoluteValuation />} />
          <Route path="absolute/dcf" element={<DCFCalculator />} />
          <Route path="absolute/ddm" element={<DDMCalculator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
