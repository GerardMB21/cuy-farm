import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from './ui/field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { InputGroup } from './ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { TypeGender, TypeMovement, type Movement } from '@/types/movement';
import { useState } from 'react';
import { cn } from 'cn';
import { toast } from './ui/toast';

type YardOption = {
  id: string
  name: string
}

type Props = {
  yards?: YardOption[]
}

const movementTypes = [
  { value: TypeMovement.add, label: 'Agregar' },
  { value: TypeMovement.transfer, label: 'Transferir' },
  { value: TypeMovement.sold, label: 'Vender' },
  { value: TypeMovement.dead, label: 'Muerte' },
];

const genders = [
  { value: TypeGender.male, label: 'Machos' },
  { value: TypeGender.female, label: 'Hembras' },
  { value: TypeGender.notDefined, label: 'Sin definir' },
];

// Hasta 2 decimales, el precio se guarda en centavos
const priceRegex = /^\d+(\.\d{1,2})?$/;

const validationSchema = z.object({
  type: z.enum(TypeMovement, { message: 'Selecciona una acción' }),
  fromYardId: z.string({ message: 'Selecciona un corral' }).min(1, { message: 'Selecciona un corral' }),
  toYardId: z.string().optional().nullable(),
  gender: z.enum(TypeGender, { message: 'Selecciona un grupo' }),
  quantity: z.number({ message: 'La cantidad es requerida' })
    .int({ message: 'Debe ser un número entero' })
    .positive({ message: 'Debe ser mayor a 0' }),
  price: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
}).superRefine((values, ctx) => {
  if (values.type === TypeMovement.transfer) {
    if (!values.toYardId) {
      ctx.addIssue({ code: 'custom', path: ['toYardId'], message: 'Selecciona el corral de destino' });
    } else if (values.toYardId === values.fromYardId) {
      ctx.addIssue({ code: 'custom', path: ['toYardId'], message: 'Debe ser distinto al corral de origen' });
    }
  }
  if (values.type === TypeMovement.sold) {
    if (!values.price) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'El precio es requerido' });
    } else if (!priceRegex.test(values.price) || Number(values.price) <= 0) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Precio inválido' });
    }
  }
});

type MovementFormValues = z.infer<typeof validationSchema>;

const MovementForm = ({ yards = [] }: Props) => {

  const [isOpenDialog, setIsOpenDialog] = useState(false)

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm<MovementFormValues>({
    resolver: zodResolver(validationSchema),
  });

  const type = watch('type');
  const isTransfer = type === TypeMovement.transfer;
  const isSold = type === TypeMovement.sold;
  const yardItems = yards.map((yard) => ({ value: yard.id, label: yard.name }));

  function openDialog() {
    setIsOpenDialog(true)
  }
  function closeDialog() {
    setIsOpenDialog(false)
    reset()
  }
  function onSubmit(values: MovementFormValues) {
    try {
      const movement: Movement = {
        type: values.type,
        fromYardId: values.fromYardId,
        toYardId: isTransfer ? values.toYardId : null,
        gender: values.gender,
        quantity: values.quantity,
        price: isSold && values.price ? Math.round(Number(values.price) * 100) : null,
        reason: values.reason || null,
      };
      console.log('movement: ', movement);
      toast.add({
        type: "success",
        description: "El movimiento ha sido registrado.",
      })
    } catch (error) {
      console.error('error: ', error);
      toast.add({
        type: "error",
        description: "Ocurrió un error al registrar el movimiento.",
        priority: "high",
      })
    } finally {
      closeDialog()
    }
  }

  return (
    <Dialog open={isOpenDialog}>
      <DialogTrigger render={() => (
        <Button type='button' variant='outline' className='capitalize' onClick={openDialog}>registrar movimiento</Button>
      )} />
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className='capitalize'>registrar movimiento</DialogTitle>
            <DialogDescription>
              Registra un ingreso, transferencia, venta o baja de cuyes en un corral
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="movement-type" className={cn('capitalize', errors.type && 'text-destructive')}>acción</FieldLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      items={movementTypes}
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="movement-type" className="w-full" aria-invalid={!!errors.type}>
                        <SelectValue placeholder="Selecciona una acción" />
                      </SelectTrigger>
                      <SelectContent>
                        {movementTypes.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <FieldDescription className="text-destructive">
                    {errors.type.message}
                  </FieldDescription>
                )}
              </Field>

              {type && (
                <>
                  <Field>
                    <FieldLabel htmlFor="from-yard" className={cn('capitalize', errors.fromYardId && 'text-destructive')}>
                      {isTransfer ? 'corral de origen' : 'corral'}
                    </FieldLabel>
                    <Controller
                      name="fromYardId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          items={yardItems}
                          value={field.value ?? null}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="from-yard" className="w-full" aria-invalid={!!errors.fromYardId}>
                            <SelectValue placeholder="Selecciona un corral" />
                          </SelectTrigger>
                          <SelectContent>
                            {yardItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.fromYardId && (
                      <FieldDescription className="text-destructive">
                        {errors.fromYardId.message}
                      </FieldDescription>
                    )}
                  </Field>

                  {isTransfer && (
                    <Field>
                      <FieldLabel htmlFor="to-yard" className={cn('capitalize', errors.toYardId && 'text-destructive')}>corral de destino</FieldLabel>
                      <Controller
                        name="toYardId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            items={yardItems}
                            value={field.value ?? null}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="to-yard" className="w-full" aria-invalid={!!errors.toYardId}>
                              <SelectValue placeholder="Selecciona un corral" />
                            </SelectTrigger>
                            <SelectContent>
                              {yardItems.map((item) => (
                                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.toYardId && (
                        <FieldDescription className="text-destructive">
                          {errors.toYardId.message}
                        </FieldDescription>
                      )}
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="gender" className={cn('capitalize', errors.gender && 'text-destructive')}>grupo afectado</FieldLabel>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          items={genders}
                          value={field.value ?? null}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="gender" className="w-full" aria-invalid={!!errors.gender}>
                            <SelectValue placeholder="Selecciona un grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {genders.map((item) => (
                              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <FieldDescription className="text-destructive">
                        {errors.gender.message}
                      </FieldDescription>
                    )}
                  </Field>

                  <div className={cn('grid gap-4', isSold && 'grid-cols-2')}>
                    <Field>
                      <FieldLabel htmlFor="quantity" className={cn('capitalize', errors.quantity && 'text-destructive')}>cantidad</FieldLabel>
                      <InputGroup className={errors.quantity ? 'border-destructive' : ''}>
                        <Controller
                          name="quantity"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="quantity"
                              placeholder="0"
                              inputMode="numeric"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          )}
                        />
                      </InputGroup>
                      {errors.quantity && (
                        <FieldDescription className="text-destructive">
                          {errors.quantity.message}
                        </FieldDescription>
                      )}
                    </Field>
                    {isSold && (
                      <Field>
                        <FieldLabel htmlFor="price" className={cn('capitalize', errors.price && 'text-destructive')}>precio</FieldLabel>
                        <InputGroup className={errors.price ? 'border-destructive' : ''}>
                          <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="price"
                                placeholder="0.00"
                                inputMode="decimal"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value.replace(',', '.'))}
                              />
                            )}
                          />
                        </InputGroup>
                        {errors.price && (
                          <FieldDescription className="text-destructive">
                            {errors.price.message}
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  </div>

                  <Field>
                    <FieldLabel htmlFor="reason" className={cn('capitalize', errors.reason && 'text-destructive')}>motivo</FieldLabel>
                    <Controller
                      name="reason"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          id="reason"
                          placeholder="Opcional"
                          {...field}
                          value={field.value ?? ''}
                        />
                      )}
                    />
                    {errors.reason && (
                      <FieldDescription className="text-destructive">
                        {errors.reason.message}
                      </FieldDescription>
                    )}
                  </Field>
                </>
              )}
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" onClick={closeDialog}>Cancelar</Button>} />
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementForm;
