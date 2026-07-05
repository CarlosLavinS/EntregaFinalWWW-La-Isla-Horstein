import { FormEvent, useState } from 'react';
import { Clock, Mail, MapPin, Phone, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';

export function Contact() {
  const { user } = useAuth();
  const { products, error } = useProducts();
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    message: '',
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const messages = JSON.parse(localStorage.getItem('sushi-contact-messages') || '[]');
    messages.push({
      ...formData,
      createdAt: new Date().toISOString(),
      backendCatalogOnline: !error,
    });
    localStorage.setItem('sushi-contact-messages', JSON.stringify(messages));
    toast.success('Mensaje registrado', {
      description: 'Quedo guardado en el navegador para seguimiento local.',
    });
    setFormData((current) => ({ ...current, message: '' }));
  };

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      <section className="bg-white px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600 font-semibold mb-3">Contacto</p>
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">Hablemos de tu pedido</h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Usa esta vista para revisar datos del local y enviar una consulta. El estado del catálogo se lee desde la
            conexión actual con el backend.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="space-y-4">
            <Info icon={<MapPin size={22} />} label="Dirección" value="Av. El Olimpo 603, Maipu, Santiago" />
            <Info icon={<Phone size={22} />} label="Teléfono" value="+56 9 8765 4321" />
            <Info icon={<Mail size={22} />} label="Email" value="contacto@fukusuke.local" />
            <Info icon={<Clock size={22} />} label="Horario" value="Lun-Dom: 11:00 - 23:00" />
            <Info
              icon={<ShieldCheck size={22} />}
              label="Catálogo"
              value={error ? 'Sin conexión al catálogo' : `${products.length} productos disponibles`}
              tone={error ? 'danger' : 'ok'}
            />
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-lg p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Nombre"
                value={formData.name}
                onChange={(value) => setFormData((current) => ({ ...current, name: value }))}
                required
              />
              <Field
                label="Teléfono"
                value={formData.phone}
                onChange={(value) => setFormData((current) => ({ ...current, phone: value }))}
                required
              />
            </div>
            <Field
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData((current) => ({ ...current, email: value }))}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Mensaje</label>
              <textarea
                value={formData.message}
                onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                required
                rows={6}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Cuéntanos qué necesitas..."
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors font-semibold"
            >
              <Send size={18} />
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'ok' | 'danger';
}) {
  const color = tone === 'ok' ? 'text-green-700' : tone === 'danger' ? 'text-red-700' : 'text-neutral-900';
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 flex gap-4">
      <div className="text-red-600 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className={`font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}
