import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, ClipboardList, Building2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSearch, type GlobalSearchResult } from '@/shared/hooks/useGlobalSearch';
import { ROUTES, buildRoute } from '@/constants';

interface GlobalSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESULT_ICON: Record<GlobalSearchResult['type'], typeof Plane> = {
  aircraft: Plane,
  workOrder: ClipboardList,
  client: Building2,
};

const RESULT_LABEL: Record<GlobalSearchResult['type'], string> = {
  aircraft: 'Aeronave',
  workOrder: 'Orden de Trabajo',
  client: 'Cliente',
};

const RESULT_ROUTE: Record<GlobalSearchResult['type'], string> = {
  aircraft: ROUTES.AIRCRAFT_DETAIL,
  workOrder: ROUTES.WORK_ORDER_DETAIL,
  client: ROUTES.CLIENT_DETAIL,
};

// Panel de busqueda global del Navbar (Fase 8): antes el boton solo togleaba un estado sin ningun
// efecto visible. Busca en paralelo por matricula de aeronave, numero de OT y nombre de cliente
// contra los endpoints ya existentes (useGlobalSearch), sin motor de busqueda dedicado.
export function GlobalSearchPanel({ isOpen, onClose }: GlobalSearchPanelProps): JSX.Element {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const { data: results, isFetching } = useGlobalSearch(term);

  const handleSelect = (result: GlobalSearchResult): void => {
    navigate(buildRoute(RESULT_ROUTE[result.type], { id: result.id }));
    setTerm('');
    onClose();
  };

  const handleClose = (): void => {
    setTerm('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={handleClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-20 mt-1 w-80 rounded-xl border border-surface-200 bg-white shadow-dropdown dark:border-surface-700 dark:bg-surface-800"
          >
            <div className="flex items-center gap-2 border-b border-surface-100 px-3 py-2 dark:border-surface-700">
              <Search size={15} className="shrink-0 text-surface-400" />
              <input
                autoFocus
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Matrícula, N° de OT o cliente..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-surface-400 dark:text-white"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {term.trim().length < 2 && (
                <p className="px-3 py-4 text-center text-sm text-surface-500">
                  Escribí al menos 2 caracteres para buscar
                </p>
              )}
              {term.trim().length >= 2 && isFetching && (
                <p className="px-3 py-4 text-center text-sm text-surface-500">Buscando...</p>
              )}
              {term.trim().length >= 2 && !isFetching && (results?.length ?? 0) === 0 && (
                <p className="px-3 py-4 text-center text-sm text-surface-500">Sin resultados</p>
              )}
              {results?.map((result) => {
                const Icon = RESULT_ICON[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aviation-50 text-aviation-600 dark:bg-aviation-900/20">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        {result.title}
                      </p>
                      <p className="truncate text-xs text-surface-500">
                        {RESULT_LABEL[result.type]} · {result.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
