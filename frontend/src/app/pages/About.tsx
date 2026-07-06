import { Award, Clock, MapPin, Package, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useProducts } from '../context/ProductContext';

export function About() {
  const navigate = useNavigate();
  const { products, categories, isLoading, error } = useProducts();
  const activeCategories = categories.filter((category) => category.id !== 'todos');

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      <section className="bg-neutral-950 text-white px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="text-red-300 font-semibold mb-3">Fukusuke Sushi</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Cocina japonesa para delivery local</h1>
            <p className="text-lg text-neutral-300 max-w-2xl">
              Preparamos sushi fresco con operación enfocada en pedidos rápidos, trazables y consistentes para clientes
              de Santiago.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1611143669185-af224c5e3252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900"
              alt="Sushi preparado"
              className="w-full h-[360px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Metric icon={<Package size={28} />} label="Productos activos" value={isLoading ? '...' : products.length.toString()} />
          <Metric icon={<Award size={28} />} label="Categorias reales" value={isLoading ? '...' : activeCategories.length.toString()} />
        </div>
        {error && <p className="max-w-7xl mx-auto mt-4 text-sm text-red-600">{error}</p>}
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Como trabajamos</h2>
            <p className="text-neutral-600">
              En Fukusuke Sushi, unimos la tradición de la cocina japonesa con la comodidad del servicio digital para que disfrutes de tus piezas favoritas estés donde estés. 
              Nuestro sistema conecta el menú, tu cuenta y nuestro local de forma inmediata para ofrecerte la mejor experiencia.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Value icon={<Clock size={24} />} title="Preparación eficiente" text="Tu pedido se organiza en la cocina apenas confirmas el pago en la web. Así garantizamos que tu sushi se prepare al momento, fresco y rápido, ya sea para despacho a domicilio o para que lo pases a retirar por nuestro mesón." />
            <Value icon={<Users size={24} />} title="Clientes registrados" text="Al crear tu cuenta con un proceso rápido y seguro, accedes a un panel exclusivo. Desde ahí puedes guardar tus datos de despacho, revisar tus pedidos frecuentes y acceder antes que nadie a nuestras mejores promociones y ofertas." />
            <Value icon={<MapPin size={24} />} title="Cobertura local" text="Para asegurar que el sushi llegue con la frescura y calidad que nos caracteriza, contamos con repartidores propios que realizan despachos gratuitos dentro de un radio de 3 kilómetros a la redonda de nuestro local en Maipú." />
            <Value icon={<ShieldCheck size={24} />} title="Datos persistentes" text="Tu información personal, tus preferencias y tus solicitudes de compra se guardan de forma totalmente segura y confidencial. Nos aseguramos de que tus transacciones y datos de contacto estén siempre protegidos bajo estrictas medidas de seguridad." />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-14 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Explora nuestra carta online</h2>
            <p className="text-neutral-300">Encuentra todos nuestros rolls, promociones y tablas disponibles al momento. Siempre actualizados para que elijas tus favoritos de forma rápida.</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors font-semibold"
          >
            Ver Menu
          </button>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-neutral-200 rounded-lg p-6">
      <div className="text-red-600 mb-4">{icon}</div>
      <p className="text-sm text-neutral-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function Value({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="text-red-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{text}</p>
    </div>
  );
}
