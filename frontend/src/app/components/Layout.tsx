import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Header } from './Header';
import { CartSidebar } from './CartSidebar';

export function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hashRoutes: Record<string, string> = {
      '#menu': '/',
      '#about': '/about',
      '#contact': '/contact',
    };
    const targetPath = hashRoutes[location.hash];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [location.hash, location.pathname, navigate]);

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      <Outlet />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
