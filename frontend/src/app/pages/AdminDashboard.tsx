import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';
import { BarChart3, CheckCircle, Clock, DollarSign, Eye, Package, PieChart, ShoppingBag, TrendingUp, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProductManagement } from '../components/ProductManagement';
import { fetchCustomers, fetchOrders, type BackendCustomer, type BackendOrder } from '../services/api';

export function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [customers, setCustomers] = useState<BackendCustomer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchOrders(), fetchCustomers()])
      .then(([backendOrders, backendCustomers]) => {
        if (!mounted) return;
        setOrders(backendOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setCustomers(backendCustomers);
        setError('');
      })
      .catch((caughtError) => {
        if (!mounted) return;
        setError(caughtError instanceof Error ? caughtError.message : 'No se pudo cargar el dashboard.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter((order) => order.status === 'CREADO').length,
      completedOrders: orders.filter((order) => order.status === 'PAGADO').length,
    }),
    [orders]
  );

  const reports = useMemo(() => buildReports(orders), [orders]);

  const customerById = (id: string) => customers.find((customer) => customer.id === id);

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Panel de Administracion</h1>
          <p className="text-neutral-600">Bienvenido, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Pedidos" value={stats.totalOrders.toString()} icon={<ShoppingBag className="text-blue-600" size={24} />} />
          <StatCard
            label="Ingresos Totales"
            value={`$${stats.totalRevenue.toLocaleString('es-CL')}`}
            icon={<DollarSign className="text-green-600" size={24} />}
          />
          <StatCard label="Pedidos Pendientes" value={stats.pendingOrders.toString()} icon={<Clock className="text-yellow-600" size={24} />} />
          <StatCard label="Pedidos Pagados" value={stats.completedOrders.toString()} icon={<CheckCircle className="text-purple-600" size={24} />} />
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Reporteria y visualizacion</h2>
              <p className="text-neutral-600">Indicadores generados con Chart.js desde pedidos reales del sistema.</p>
            </div>
            <BarChart3 className="text-blue-600" size={24} />
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-neutral-500">Cargando reportes...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">Aun no hay datos para graficar.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <ReportChart title="Ingresos ultimos 7 dias" description="Ventas agrupadas por fecha" config={reports.revenueByDayConfig} className="xl:col-span-2" />
              <ReportChart title="Pedidos por estado" description="Distribucion operacional" config={reports.ordersByStatusConfig} />
              {reports.hasTopProducts ? (
                <ReportChart title="Productos mas vendidos" description="Unidades vendidas por producto" config={reports.topProductsConfig} className="xl:col-span-3" />
              ) : (
                <div className="xl:col-span-3 border border-neutral-200 rounded-xl p-12 text-center text-neutral-500">
                  No hay productos vigentes para mostrar en el ranking.
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mb-8">
          <ProductManagement />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">Pedidos Recientes</h2>
            <TrendingUp className="text-green-500" size={20} />
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-neutral-500">Cargando pedidos...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-neutral-300 mb-4" size={64} />
              <p className="text-xl text-neutral-500 mb-2">No hay pedidos aun</p>
              <p className="text-neutral-400">Los pedidos apareceran aqui cuando los clientes compren</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Productos</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.map((order) => {
                    const customer = customerById(order.customerId);
                    return (
                      <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-neutral-900 font-medium">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{new Date(order.createdAt).toLocaleString('es-CL')}</td>
                        <td className="px-6 py-4 text-sm text-neutral-900">{customer?.fullName ?? order.customerId}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-neutral-900">${order.total.toLocaleString('es-CL')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            <Eye size={16} />
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900">Pedido #{selectedOrder.id}</h3>
                  <p className="text-neutral-600">{new Date(selectedOrder.createdAt).toLocaleString('es-CL')}</p>
                </div>
                <button className="text-neutral-500 hover:text-neutral-900" onClick={() => setSelectedOrder(null)}>
                  Cerrar
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-600">Cliente</p>
                  <p className="font-semibold">{customerById(selectedOrder.customerId)?.fullName ?? selectedOrder.customerId}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Entrega</p>
                  <p className="font-semibold">{selectedOrder.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Productos</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.productId} className="flex justify-between border-b border-neutral-100 pb-2">
                        <span>{getProductDisplayName(item)} x {item.quantity}</span>
                        <span className="font-semibold">${item.subtotal.toLocaleString('es-CL')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t text-xl font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.total.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportChart({
  title,
  description,
  config,
  className = '',
}: {
  title: string;
  description: string;
  config: ChartConfiguration;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, config);

    return () => {
      chart.destroy();
    };
  }, [config]);

  return (
    <div className={`border border-neutral-200 rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
        <PieChart className="text-neutral-400 shrink-0" size={20} />
      </div>
      <div className="relative h-72">
        <canvas ref={canvasRef} aria-label={title} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">{icon}</div>
        <TrendingUp className="text-green-500" size={20} />
      </div>
      <h3 className="text-neutral-600 text-sm mb-1">{label}</h3>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
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

function buildReports(orders: BackendOrder[]) {
  const currencyFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: formatDateKey(date),
      label: date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
    };
  });
  const revenueByDay = new Map(lastSevenDays.map((day) => [day.key, 0]));
  const ordersByStatus = new Map<string, number>();
  const productSales = new Map<string, number>();

  orders.forEach((order) => {
    const orderKey = formatDateKey(new Date(order.createdAt));

    if (revenueByDay.has(orderKey)) {
      revenueByDay.set(orderKey, (revenueByDay.get(orderKey) ?? 0) + order.total);
    }

    ordersByStatus.set(order.status, (ordersByStatus.get(order.status) ?? 0) + 1);

    order.items.filter((item) => item.product).forEach((item) => {
      const productName = item.product!.name;
      productSales.set(productName, (productSales.get(productName) ?? 0) + item.quantity);
    });
  });

  const topProducts = [...productSales.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const statusEntries = [...ordersByStatus.entries()];

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#404040',
          boxWidth: 12,
          font: { size: 12 },
        },
      },
    },
  };

  return {
    revenueByDayConfig: {
      type: 'bar',
      data: {
        labels: lastSevenDays.map((day) => day.label),
        datasets: [
          {
            label: 'Ingresos',
            data: lastSevenDays.map((day) => revenueByDay.get(day.key) ?? 0),
            backgroundColor: '#2563eb',
            borderRadius: 8,
          },
        ],
      },
      options: {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#525252',
              callback: (value) => currencyFormatter.format(Number(value)),
            },
          },
          x: {
            ticks: { color: '#525252' },
            grid: { display: false },
          },
        },
      },
    } satisfies ChartConfiguration,
    ordersByStatusConfig: {
      type: 'doughnut',
      data: {
        labels: statusEntries.map(([status]) => getStatusText(status)),
        datasets: [
          {
            label: 'Pedidos',
            data: statusEntries.map(([, count]) => count),
            backgroundColor: ['#16a34a', '#f59e0b', '#2563eb', '#dc2626', '#737373'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        ...baseOptions,
        cutout: '62%',
      },
    } satisfies ChartConfiguration,
    topProductsConfig: {
      type: 'bar',
      data: {
        labels: topProducts.map(([name]) => name),
        datasets: [
          {
            label: 'Unidades vendidas',
            data: topProducts.map(([, quantity]) => quantity),
            backgroundColor: '#0f766e',
            borderRadius: 8,
          },
        ],
      },
      options: {
        ...baseOptions,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: '#525252', precision: 0 },
          },
          y: {
            ticks: { color: '#525252' },
            grid: { display: false },
          },
        },
      },
    } satisfies ChartConfiguration,
    hasTopProducts: topProducts.length > 0,
  };
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getProductDisplayName(item: BackendOrder['items'][number]) {
  return item.product?.name ?? 'Producto eliminado';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'CREADO':
      return 'bg-yellow-100 text-yellow-700';
    case 'PAGADO':
      return 'bg-green-100 text-green-700';
    case 'ANULADO':
      return 'bg-red-100 text-red-700';
    case 'EN_DESPACHO':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'CREADO':
      return <Clock size={16} />;
    case 'PAGADO':
      return <CheckCircle size={16} />;
    case 'ANULADO':
      return <XCircle size={16} />;
    case 'EN_DESPACHO':
      return <Package size={16} />;
    default:
      return null;
  }
}
