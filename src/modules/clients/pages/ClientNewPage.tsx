import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { ROUTES } from '@/constants';

const clientSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  businessName: z.string().min(2, 'Mínimo 2 caracteres'),
  taxId: z
    .string()
    .regex(/^\d{2}-\d{8}-\d$/, 'Formato CUIT: XX-XXXXXXXX-X'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),
  address: z.string().min(5, 'Requerido'),
  city: z.string().min(2, 'Requerido'),
  province: z.string().min(2, 'Requerido'),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export function ClientNewPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = async (_data: ClientFormData): Promise<void> => {
    await new Promise((r) => setTimeout(r, 800));
    navigate(ROUTES.CLIENTS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <PageHeader
        title="Nuevo Cliente"
        description="Registrá un nuevo cliente u operador aéreo"
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => navigate(ROUTES.CLIENTS)}
          >
            Volver
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <div className="space-y-5">
          {/* Datos fiscales */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Fiscales</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre comercial"
                  placeholder="Ej. Aeroclub del Litoral"
                  error={errors.name?.message}
                  required
                  {...register('name')}
                />
                <Input
                  label="Razón social"
                  placeholder="Ej. Aeroclub del Litoral SA"
                  error={errors.businessName?.message}
                  required
                  {...register('businessName')}
                />
                <Input
                  label="CUIT"
                  placeholder="XX-XXXXXXXX-X"
                  error={errors.taxId?.message}
                  required
                  {...register('taxId')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  label="Email"
                  placeholder="contacto@empresa.com"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                <Input
                  label="Teléfono"
                  placeholder="+54 11 1234-5678"
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />
                <Input
                  label="Dirección"
                  placeholder="Calle y número"
                  error={errors.address?.message}
                  required
                  {...register('address')}
                />
                <Input
                  label="Ciudad"
                  placeholder="Ciudad"
                  error={errors.city?.message}
                  required
                  {...register('city')}
                />
                <Input
                  label="Provincia"
                  placeholder="Provincia"
                  error={errors.province?.message}
                  required
                  {...register('province')}
                />
              </div>
            </CardBody>
          </Card>

          {/* Contacto operativo (opcional) */}
          <Card>
            <CardHeader>
              <CardTitle>
                Contacto Operativo{' '}
                <span className="text-sm font-normal text-surface-400">(opcional)</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Persona de contacto"
                  placeholder="Nombre y apellido"
                  error={errors.contactPerson?.message}
                  {...register('contactPerson')}
                />
                <Input
                  label="Teléfono de contacto"
                  placeholder="+54 11 1234-5678"
                  error={errors.contactPhone?.message}
                  {...register('contactPhone')}
                />
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.CLIENTS)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={15} />}>
              Registrar Cliente
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
