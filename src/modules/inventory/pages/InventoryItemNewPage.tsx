import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { ROUTES, INVENTORY_CATEGORY_LABELS } from '@/constants';
import { useCreateInventoryItem, useAddInventoryMovement } from '@/modules/inventory/hooks/useInventory';
import { useUIStore } from '@/store/uiStore';
import type { SelectOption } from '@/types';

// MODIFICADO: se agrega el campo opcional maximumStock, con validacion de que si se informa debe ser mayor a minimumStock
// ANTERIOR: no incluia maximumStock; los valores del enum ya coincidian con InventoryCategory (PascalCase) para poder enviarse tal cual al payload de creación
const inventorySchema = z
  .object({
    partNumber: z.string().min(1, 'Requerido'),
    description: z.string().min(5, 'Mínimo 5 caracteres'),
    category: z.enum([
      'RepuestoMotor',
      'RepuestoCelula',
      'Consumible',
      'Herramienta',
      'Material',
      'Instrumento',
      'Avionico',
    ]),
    manufacturer: z.string().min(1, 'Requerido'),
    location: z.string().min(1, 'Requerido'),
    currentStock: z.number().min(0),
    minimumStock: z.number().min(0),
    // El input numerico vacio llega como NaN via valueAsNumber; se normaliza a undefined antes de validar
    maximumStock: z.preprocess(
      (val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val),
      z.number().min(0).optional()
    ),
    unit: z.string().min(1, 'Requerido'),
    unitCost: z.number().min(0),
    certificationRequired: z.boolean(),
    certificateNumber: z.string().optional(),
    expiryDate: z.string().optional(),
  })
  .refine(
    (data) => data.maximumStock === undefined || data.maximumStock > data.minimumStock,
    { message: 'El stock máximo debe ser mayor al stock mínimo', path: ['maximumStock'] }
  );

type InventoryFormData = z.infer<typeof inventorySchema>;

// Construye las opciones del select de categoría a partir de las etiquetas oficiales de InventoryCategory
const CATEGORY_OPTIONS: SelectOption[] = Object.entries(INVENTORY_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);

const UNIT_OPTIONS: SelectOption[] = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'litro', label: 'Litro' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'metro', label: 'Metro' },
  { value: 'par', label: 'Par' },
  { value: 'juego', label: 'Juego' },
];

export function InventoryItemNewPage(): JSX.Element {
  const navigate = useNavigate();
  const { mutate: createItem, isPending } = useCreateInventoryItem();
  const { mutate: addMovement, isPending: isAddingMovement } = useAddInventoryMovement();
  const addToast = useUIStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      currentStock: 0,
      minimumStock: 1,
      unitCost: 0,
      certificationRequired: false,
    },
  });

  const certRequired = watch('certificationRequired');

  // MODIFICADO: la API siempre crea el ítem con currentStock = 0; si el usuario ingresó un stock inicial mayor a 0,
  // se dispara automáticamente un movimiento de entrada por esa cantidad para que el alta se sienta como un solo paso.
  // Si el movimiento falla se avisa con un toast de advertencia pero no se bloquea la navegación (el ítem ya se creó).
  // ANTERIOR: enviaba el formulario al backend con useCreateInventoryItem y navegaba al listado al finalizar, sin cargar stock
  const onSubmit = (data: InventoryFormData): void => {
    createItem(data, {
      onSuccess: (item) => {
        if (data.currentStock > 0) {
          addMovement(
            {
              id: item.id,
              payload: {
                type: 'Entrada',
                quantity: data.currentStock,
                reason: 'Stock inicial de alta',
              },
            },
            {
              onSuccess: () => navigate(ROUTES.INVENTORY),
              onError: (err: Error) => {
                addToast({
                  type: 'warning',
                  title: 'Ítem creado sin stock inicial',
                  description: `El ítem se registró pero no se pudo cargar el stock inicial: ${err.message}`,
                });
                navigate(ROUTES.INVENTORY);
              },
            }
          );
        } else {
          navigate(ROUTES.INVENTORY);
        }
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title="Nuevo Ítem de Inventario"
        description="Agregá un nuevo repuesto o material al pañol"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.INVENTORY)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Identificación */}
          <Card>
            <CardHeader>
              <CardTitle>Identificación</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Número de parte"
                  placeholder="P/N"
                  error={errors.partNumber?.message}
                  required
                  {...register('partNumber')}
                />
                <Select
                  label="Categoría"
                  options={CATEGORY_OPTIONS}
                  placeholder="Seleccionar"
                  error={errors.category?.message}
                  required
                  {...register('category')}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Descripción"
                    placeholder="Descripción del ítem"
                    error={errors.description?.message}
                    required
                    {...register('description')}
                  />
                </div>
                <Input
                  label="Fabricante"
                  placeholder="Fabricante o proveedor"
                  error={errors.manufacturer?.message}
                  required
                  {...register('manufacturer')}
                />
                <Input
                  label="Ubicación en pañol"
                  placeholder="Ej. Estante A-3"
                  error={errors.location?.message}
                  required
                  {...register('location')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Stock y costo */}
          <Card>
            <CardHeader>
              <CardTitle>Stock y Costo</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="number"
                  label="Stock actual"
                  min="0"
                  error={errors.currentStock?.message}
                  required
                  {...register('currentStock', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  label="Stock mínimo"
                  min="0"
                  error={errors.minimumStock?.message}
                  required
                  {...register('minimumStock', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  label="Stock máximo (opcional)"
                  min="0"
                  error={errors.maximumStock?.message}
                  {...register('maximumStock', { valueAsNumber: true })}
                />
                <Select
                  label="Unidad"
                  options={UNIT_OPTIONS}
                  placeholder="Seleccionar"
                  error={errors.unit?.message}
                  required
                  {...register('unit')}
                />
                <Input
                  type="number"
                  label="Costo unitario ($)"
                  min="0"
                  step="0.01"
                  error={errors.unitCost?.message}
                  required
                  {...register('unitCost', { valueAsNumber: true })}
                />
              </div>
            </CardBody>
          </Card>

          {/* Certificación */}
          <Card>
            <CardHeader>
              <CardTitle>Certificación y Vencimiento</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-300 text-aviation-600 focus:ring-aviation-500"
                    {...register('certificationRequired')}
                  />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    Requiere certificación ANAC
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  {certRequired && (
                    <Input
                      label="Número de certificado"
                      placeholder="N° certificado ANAC"
                      error={errors.certificateNumber?.message}
                      {...register('certificateNumber')}
                    />
                  )}
                  <Input
                    type="date"
                    label="Fecha de vencimiento (opcional)"
                    error={errors.expiryDate?.message}
                    {...register('expiryDate')}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.INVENTORY)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting || isPending || isAddingMovement} leftIcon={<Save size={15} />}>
              Agregar al Pañol
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
