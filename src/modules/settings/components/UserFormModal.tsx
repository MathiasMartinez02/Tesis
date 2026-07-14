import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Save } from 'lucide-react';
import { Modal } from '@/shared/components/Modal/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { ROLE_LABELS } from '@/constants';
import type { SelectOption, User, UserRole } from '@/types';

const ROLE_OPTIONS: SelectOption[] = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Esquema del formulario de alta/edicion de usuario: password solo se exige al crear (ver refine)
const userFormSchema = z
  .object({
    email: z.string().min(1, 'El email es requerido').email('Email invalido'),
    password: z.string().optional(),
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    role: z.enum([
      'Gerente',
      'OficinaTecnica',
      'Inspector',
      'JefeTaller',
      'Mecanico',
      'Panol',
      'Administracion',
    ]),
    licenseNumber: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === undefined || data.password.length === 0 || data.password.length >= 8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
    path: ['password'],
  });

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si se pasa un usuario, el modal edita en vez de crear */
  user?: User | null;
}

// Modal de alta/edicion de usuario: en modo alta pide password (minimo 8), en modo edicion lo oculta y solo permite tocar perfil/rol
export function UserFormModal({ isOpen, onClose, user }: UserFormModalProps): JSX.Element {
  const isEditMode = !!user;
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { role: 'Mecanico' },
  });

  // Precarga el formulario con los datos del usuario al abrir en modo edicion, o lo limpia en modo alta
  useEffect(() => {
    if (isOpen) {
      reset(
        user
          ? {
              email: user.email,
              password: '',
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              licenseNumber: user.licenseNumber ?? '',
              phone: user.phone ?? '',
            }
          : { email: '', password: '', firstName: '', lastName: '', role: 'Mecanico', licenseNumber: '', phone: '' }
      );
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: UserFormData): void => {
    if (isEditMode && user) {
      updateUser(
        {
          id: user.id,
          payload: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role as UserRole,
            licenseNumber: data.licenseNumber || undefined,
            phone: data.phone || undefined,
          },
        },
        { onSuccess: onClose }
      );
      return;
    }

    createUser(
      {
        email: data.email,
        password: data.password ?? '',
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as UserRole,
        licenseNumber: data.licenseNumber || undefined,
        phone: data.phone || undefined,
      },
      { onSuccess: onClose }
    );
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
      description={
        isEditMode
          ? 'Modificá los datos de perfil y el rol del usuario'
          : 'Creá una cuenta nueva para un usuario del sistema'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={isEditMode ? <Save size={15} /> : <UserPlus size={15} />}
            isLoading={isSubmitting || isPending}
            onClick={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)();
            }}
          >
            {isEditMode ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <Input
          label="Email"
          type="email"
          disabled={isEditMode}
          error={errors.email?.message}
          required
          {...register('email')}
        />
        {!isEditMode && (
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            required
            {...register('password')}
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" error={errors.firstName?.message} required {...register('firstName')} />
          <Input label="Apellido" error={errors.lastName?.message} required {...register('lastName')} />
        </div>
        <Select
          label="Rol"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          required
          {...register('role')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="N° de licencia (opcional)" error={errors.licenseNumber?.message} {...register('licenseNumber')} />
          <Input label="Teléfono (opcional)" error={errors.phone?.message} {...register('phone')} />
        </div>
      </form>
    </Modal>
  );
}
