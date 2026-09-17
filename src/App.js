import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './content/ContentProvider';
import SiteMenu from './components/SiteMenu';
import Home from './pages/Home';
import LinkTree from './pages/LinkTree';
import Admin from './pages/Admin';
import MediaPost from './pages/MediaPost';

function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <SiteMenu />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/links" element={<LinkTree />} />
          <Route path="/media/:slug" element={<MediaPost />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}

export default App;
