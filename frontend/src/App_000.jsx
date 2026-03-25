import './App.css';

import Header from './components/header';
import MenuLeft from './components/menu-left';
import Footer from './components/footer';
import Main from './components/main';

export default function App() {
  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen">
        <MenuLeft />
        <Main />
      </div>
      <Footer />
    </>
  );
}
