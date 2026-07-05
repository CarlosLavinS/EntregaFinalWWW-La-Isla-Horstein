import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, CreditCard, Home, Mail, MapPin, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createCheckoutOrder } from '../services/api';

export function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    commune: '',
    reference: '',
    comments: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getCartTotal();
  const discount = subtotal > 35000 ? subtotal * 0.2 : 0;
  const deliveryFee = deliveryMethod === 'delivery' ? 2990 : 0;
  const total = subtotal - discount + deliveryFee;

  const comunas = [
    'Providencia',
    'Las Condes',
    'Vitacura',
    'Nunoa',
    'La Reina',
    'Santiago Centro',
    'Recoleta',
    'Independencia',
    'Quinta Normal',
    'Estacion Central',
    'Maipu',
    'La Florida',
    'Puente Alto',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'El telefono es requerido';

    if (deliveryMethod === 'delivery') {
      if (!formData.address.trim()) newErrors.address = 'La direccion es requerida';
      if (!formData.commune) newErrors.commune = 'La comuna es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (cart.length === 0) {
      toast.error('Tu carrito esta vacio');
      return;
    }

    if (!user?.id) {
      toast.error('Debes iniciar sesion para crear el pedido');
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryAddress =
        deliveryMethod === 'delivery'
          ? `${formData.address}${formData.reference ? `, ${formData.reference}` : ''}`
          : 'Retiro en tienda';

      const order = await createCheckoutOrder({
        customerId: user.id,
        deliveryAddress,
        distanceKm: deliveryMethod === 'delivery' ? 2.5 : 0,
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod,
      });

      toast.success('Pedido registrado en el backend', {
        duration: 3000,
        description: `Orden ${order.id} - ${order.status}`,
      });

      clearCart();
      setTimeout(() => navigate('/my-orders'), 1200);
    } catch (error) {
      toast.error('No se pudo registrar el pedido', {
        description: error instanceof Error ? error.message : 'Error desconocido del backend',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">Carrito</div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Tu carrito esta vacio</h2>
            <p className="text-neutral-600 mb-8">Agrega algunos productos antes de ir al checkout</p>
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

        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Metodo de Entrega</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'border-red-600 bg-red-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Home className={`mx-auto mb-2 ${deliveryMethod === 'delivery' ? 'text-red-600' : 'text-neutral-400'}`} size={32} />
                    <div className="font-semibold">Delivery</div>
                    <div className="text-sm text-neutral-600">$2.990</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'border-red-600 bg-red-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Clock className={`mx-auto mb-2 ${deliveryMethod === 'pickup' ? 'text-red-600' : 'text-neutral-400'}`} size={32} />
                    <div className="font-semibold">Retiro en Tienda</div>
                    <div className="text-sm text-neutral-600">Gratis</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Informacion de Contacto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-red-600 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-red-600 transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-red-600 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-neutral-200'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-4">Direccion de Entrega</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Direccion *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-red-600 transition-colors ${
                          errors.address ? 'border-red-500' : 'border-neutral-200'
                        }`}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Comuna *</label>
                      <select
                        name="commune"
                        value={formData.commune}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-red-600 transition-colors ${
                          errors.commune ? 'border-red-500' : 'border-neutral-200'
                        }`}
                      >
                        <option value="">Selecciona una comuna</option>
                        {comunas.map((comuna) => (
                          <option key={comuna} value={comuna}>
                            {comuna}
                          </option>
                        ))}
                      </select>
                      {errors.commune && <p className="text-red-500 text-sm mt-1">{errors.commune}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Referencia</label>
                      <input
                        type="text"
                        name="reference"
                        value={formData.reference}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-red-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Metodo de Pago</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-red-600 bg-red-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'card' ? 'text-red-600' : 'text-neutral-400'}`} size={32} />
                    <div className="font-semibold">Tarjeta</div>
                    <div className="text-sm text-neutral-600">Debito/Credito</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-red-600 bg-red-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-4xl block mb-2">$</span>
                    <div className="font-semibold">Efectivo</div>
                    <div className="text-sm text-neutral-600">Al recibir</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Comentarios Adicionales</h2>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-red-600 transition-colors resize-none"
                />
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-neutral-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-neutral-600 text-sm">
                        {item.quantity} x ${item.price.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento (20%)</span>
                    <span>-${discount.toLocaleString('es-CL')}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Costo de envio</span>
                    <span>${deliveryFee.toLocaleString('es-CL')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-2xl font-bold text-neutral-900 mb-6">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-4 rounded-full hover:bg-red-700 transition-colors font-semibold text-lg disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {isSubmitting ? 'Registrando pedido...' : 'Realizar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
