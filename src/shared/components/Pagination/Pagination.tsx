import { Button } from '@/shared/components/ui/Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Paginador simple con rango mostrado y botones anterior/siguiente
export function Pagination({ page, pageSize, total, totalPages, onPageChange }: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className="flex items-center justify-between text-sm text-surface-500" aria-label="Paginación">
      <span>
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
