import { Outlet } from 'react-router-dom';
import { Plane } from 'lucide-react';

export function AuthLayout(): JSX.Element {
  return (
    <div className="flex min-h-full">
      {/* Panel lateral decorativo */}
      <div className="hidden bg-gradient-aviation lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Plane size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SIGMA</span>
        </div>

        <div className="text-white">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Sistema Integrado de Gestión de Mantenimiento Aeronáutico
          </h1>
          <p className="text-aviation-200 text-lg leading-relaxed">
            Trazabilidad total. Seguridad operacional. Control técnico.
            Una plataforma diseñada para cumplir con los más altos estándares aeronáuticos.
          </p>

          {/* Stats decorativos */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Aeronaves activas', value: '48+' },
              { label: 'OT completadas', value: '1.2K+' },
              { label: 'Inspecciones', value: '320+' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-aviation-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-aviation-400 text-sm">
          © {new Date().getFullYear()} SIGMA. Todos los derechos reservados.
        </p>
      </div>

      {/* Formulario */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <Outlet />
      </div>
    </div>
  );
}
