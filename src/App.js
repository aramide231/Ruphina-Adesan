import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './content/ContentProvider';
import Home from './pages/Home';
import LinkTree from './pages/LinkTree';
import Admin from './pages/Admin';

function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/links" element={<LinkTree />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}

export default App;
