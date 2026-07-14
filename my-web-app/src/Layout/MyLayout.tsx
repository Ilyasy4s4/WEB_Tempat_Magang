import { Outlet, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />
      
      {isHome ? (
        <main className="flex-grow">
          <Outlet />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto py-8 px-6 flex-grow w-full">
          <Outlet />
        </main>
      )}

      <Footer />
    </div>
  );
}