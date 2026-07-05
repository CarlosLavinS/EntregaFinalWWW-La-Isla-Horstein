import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, CreditCard, MapPin, Package, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart, type Product } from '../context/CartContext';
import { fetchOrders, type BackendOrder } from '../services/api';

type UiOrder = BackendOrder & {
  date: string;
  itemsForCart: Product[];
};

export function MyOrders() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchOrders()
      .then((backendOrders) => {
        if (!mounted) return;
        const userOrders = backendOrders
          .filter((order) => order.customerId === user?.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map(toUiOrder);
        setOrders(userOrders);
      })
      .catch((error) => {
        toast.error('No se pudieron cargar tus pedidos', {
          description: error instanceof Error ? error.message : 'Error desconocido del backend',
        });
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleReorder = (order: UiOrder) => {
    order.itemsForCart.forEach((item) => {
      const quantity = order.items.find((orderItem) => orderItem.productId === item.id)?.quantity ?? 1;
      for (let i = 0; i < quantity; i++) {
        addToCart(item);
      }
    });

    toast.success('Pedido agregado al carrito');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-neutral-500">Cargando pedidos...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Volver al menu</span>
          </button>

          <div className="text-center">
            <Package className="mx-auto text-neutral-300 mb-4" size={64} />
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">No tienes pedidos todavia</h2>
            <p className="text-neutral-600 mb-8">Realiza tu primer pedido para verlo aqui</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              Ver Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Volver al menu</span>
        </button>

        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Mis Pedidos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="text-red-600" size={24} />
                      <h3 className="text-xl font-bold text-neutral-900">Pedido #{order.id}</h3>
                    </div>
                    <p className="text-sm text-neutral-600 flex items-center gap-2">
                      <Clock size={14} />
                      {order.date}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name ?? item.productId}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.name ?? item.productId}</p>
                        <p className="text-xs text-neutral-600">
                          {item.quantity} x ${item.unitPrice.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      {order.deliveryAddress === 'Retiro en tienda' ? <ShoppingBag size={14} /> : <MapPin size={14} />}
                      {order.deliveryAddress === 'Retiro en tienda' ? 'Retiro' : 'Delivery'}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={14} />
                      {order.status === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-neutral-900">${order.total.toLocaleString('es-CL')}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReorder(order);
                  }}
                  className="w-full mt-4 bg-red-600 text-white py-3 rounded-full hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Repetir Pedido
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Detalle del Pedido</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-600">Numero de Pedido</p>
                    <p className="font-bold text-lg">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Fecha</p>
                    <p className="font-semibold">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Estado</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-neutral-600 mb-2">Entrega</p>
                    <p className="font-semibold">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-neutral-600 mb-3">Productos</p>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedOrder.items.map((item) => (
                        <div key={item.productId} className="flex gap-3">
                          <img
                            src={item.product?.imageUrl}
                            alt={item.product?.name ?? item.productId}
                            className="w-14 h-14 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product?.name ?? item.productId}</p>
                            <p className="text-xs text-neutral-600">
                              {item.quantity} x ${item.unitPrice.toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-2xl font-bold text-red-600">${selectedOrder.total.toLocaleString('es-CL')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
                <div className="text-center text-neutral-400 py-12">
                  <Package size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Selecciona un pedido para ver los detalles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toUiOrder(order: BackendOrder): UiOrder {
  return {
    ...order,
    date: new Date(order.createdAt).toLocaleString('es-CL'),
    itemsForCart: order.items
      .filter((item) => item.product)
      .map((item) => ({
        id: item.product!.id,
        name: item.product!.name,
        description: item.product!.description,
        price: item.product!.price,
        image: item.product!.imageUrl,
        category: item.product!.categoryId,
      })),
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case 'CREADO':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAGADO':
      return 'bg-green-100 text-green-800';
    case 'ANULADO':
      return 'bg-red-100 text-red-800';
    case 'EN_DESPACHO':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'CREADO':
      return 'Creado';
    case 'PAGADO':
      return 'Pagado';
    case 'ANULADO':
      return 'Anulado';
    case 'EN_DESPACHO':
      return 'En despacho';
    default:
      return status;
  }
}
