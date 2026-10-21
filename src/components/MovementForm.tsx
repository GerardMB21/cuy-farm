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
import type { Yard } from '@/types/yard';
import { createMovement } from '@/routes/movements';
import { getYards } from '@/routes/yards';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { cn } from 'cn';
import { toast } from './ui/toast';

// Solo se pueden listar corrales ya creados, por eso el id es requerido aquí
type YardOption = Pick<Yard, 'name'> & { id: string }

const movementTypes = [
  { value: TypeMovement.add, label: 'Agregar' },
  { value: TypeMovement.transfer, label: 'Transferir' },
  { value: TypeMovement.sold, label: 'Vender' },
  { value: TypeMovement.dead, label: 'Muerte' },
  { value: TypeMovement.define, label: 'Definir' },
];

const genders = [
  { value: TypeGender.male, label: 'Machos' },
  { value: TypeGender.female, label: 'Hembras' },
  { value: TypeGender.notDefined, label: 'Crías' },
];

// Un define siempre termina en un sexo conocido
const definedGenders = genders.filter((gender) => gender.value !== TypeGender.notDefined);

// En define el destino es opcional, vacío significa el mismo corral
const SAME_YARD = '';

// Hasta 2 decimales, el precio se guarda en centavos
const priceRegex = /^\d+(\.\d{1,2})?$/;

const validationSchema = z.object({
  type: z.enum(TypeMovement, { message: 'Selecciona una acción' }),
  fromYardId: z.string({ message: 'Selecciona un corral' }).min(1, { message: 'Selecciona un corral' }),
  toYardId: z.string().optional().nullable(),
  genderFrom: z.enum(TypeGender, { message: 'Selecciona un grupo' }),
  genderTo: z.enum([TypeGender.male, TypeGender.female], { message: 'Selecciona el nuevo grupo' }).optional().nullable(),
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
  if (values.type === TypeMovement.define) {
    if (!values.genderTo) {
      ctx.addIssue({ code: 'custom', path: ['genderTo'], message: 'Selecciona el nuevo grupo' });
    } else if (values.genderTo === values.genderFrom) {
      ctx.addIssue({ code: 'custom', path: ['genderTo'], message: 'Debe ser distinto a definir desde' });
    }
    if (values.toYardId && values.toYardId === values.fromYardId) {
      ctx.addIssue({ code: 'custom', path: ['toYardId'], message: 'Deja vacío para el mismo corral' });
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

const MovementForm = () => {

  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const [yards, setYards] = useState<YardOption[]>([])

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
  const isDefine = type === TypeMovement.define;
  const yardItems = yards.map((yard) => ({ value: yard.id, label: yard.name }));
  const toYardItems = isDefine ? [{ value: SAME_YARD, label: 'Mismo corral' }, ...yardItems] : yardItems;

  async function openDialog() {
    setIsOpenDialog(true)
    try {
      const data = await getYards()
      setYards(data.filter((yard): yard is YardOption => !!yard.id))
    } catch (error) {
      console.error('error: ', error);
      toast.add({
        type: "error",
        description: "No se pudieron cargar los corrales.",
        priority: "high",
      })
    }
  }
  function closeDialog() {
    setIsOpenDialog(false)
    reset()
  }
  async function onSubmit(values: MovementFormValues) {
    try {
      const movement: Movement = {
        type: values.type,
        fromYardId: values.fromYardId,
        toYardId: isTransfer || isDefine ? values.toYardId || null : null,
        genderFrom: values.genderFrom,
        // El backend rechaza genderTo fuera de define, undefined lo omite del body
        genderTo: isDefine ? values.genderTo : undefined,
        quantity: values.quantity,
        price: isSold && values.price ? Math.round(Number(values.price) * 100) : null,
        reason: values.reason || null,
      };
      await createMovement(movement);
      window.dispatchEvent(new CustomEvent('cuy:data-changed'));
      toast.add({
        type: "success",
        description: "El movimiento ha sido registrado.",
      })
    } catch (error) {
      console.error('error: ', error);
      const isNotEnough = isAxiosError(error) && error.response?.status === 409;
      toast.add({
        type: "error",
        description: isNotEnough
          ? "El corral de origen no tiene suficientes cuyes para este movimiento."
          : "Ocurrió un error al registrar el movimiento.",
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-sm" showCloseButton={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className='capitalize'>registrar movimiento</DialogTitle>
            <DialogDescription>
              Registra un ingreso, transferencia, venta, baja o definición de sexo de cuyes en un corral
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
                      {isTransfer || isDefine ? 'corral de origen' : 'corral'}
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

                  {(isTransfer || isDefine) && (
                    <Field>
                      <FieldLabel htmlFor="to-yard" className={cn('capitalize', errors.toYardId && 'text-destructive')}>corral de destino</FieldLabel>
                      <Controller
                        name="toYardId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            items={toYardItems}
                            value={field.value ?? (isDefine ? SAME_YARD : null)}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="to-yard" className="w-full" aria-invalid={!!errors.toYardId}>
                              <SelectValue placeholder="Selecciona un corral" />
                            </SelectTrigger>
                            <SelectContent>
                              {toYardItems.map((item) => (
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
                    <FieldLabel htmlFor="gender-from" className={cn('capitalize', errors.genderFrom && 'text-destructive')}>
                      {isDefine ? 'definir desde' : 'grupo afectado'}
                    </FieldLabel>
                    <Controller
                      name="genderFrom"
                      control={control}
                      render={({ field }) => (
                        <Select
                          items={genders}
                          value={field.value ?? null}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="gender-from" className="w-full" aria-invalid={!!errors.genderFrom}>
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
                    {errors.genderFrom && (
                      <FieldDescription className="text-destructive">
                        {errors.genderFrom.message}
                      </FieldDescription>
                    )}
                  </Field>

                  {isDefine && (
                    <Field>
                      <FieldLabel htmlFor="gender-to" className={cn('capitalize', errors.genderTo && 'text-destructive')}>definir como</FieldLabel>
                      <Controller
                        name="genderTo"
                        control={control}
                        render={({ field }) => (
                          <Select
                            items={definedGenders}
                            value={field.value ?? null}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="gender-to" className="w-full" aria-invalid={!!errors.genderTo}>
                              <SelectValue placeholder="Selecciona el nuevo grupo" />
                            </SelectTrigger>
                            <SelectContent>
                              {definedGenders.map((item) => (
                                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.genderTo && (
                        <FieldDescription className="text-destructive">
                          {errors.genderTo.message}
                        </FieldDescription>
                      )}
                    </Field>
                  )}

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
