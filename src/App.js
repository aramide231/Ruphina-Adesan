import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LinkTree from './pages/LinkTree';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/links" element={<LinkTree />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
