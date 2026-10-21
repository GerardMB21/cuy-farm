import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field';
import { Input } from './ui/input';
import type { Yard } from '@/types/yard';
import { createYard } from '@/routes/yards';
import { InputGroup } from './ui/input-group';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState } from 'react';
import { cn } from 'cn';
import { toast } from './ui/toast';

const validationSchema = z.object({
  name: z.string({ message: 'El nombre es requerido' }),
  initialMales: z.number().optional().nullable(),
  initialFemales: z.number().optional().nullable(),
  initialBabies: z.number().optional().nullable(),
});

const YardForm = () => {

  const [isOpenDialog, setIsOpenDialog] = useState(false)

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    control,
  } = useForm<Yard>({
    resolver: zodResolver(validationSchema),
  });

  function openDialog() {
    setIsOpenDialog(true)
  }
  function closeDialog() {
    setIsOpenDialog(false)
  }
  async function onSubmit(values: Yard) {
    try {
      await createYard({
        name: values.name,
        initialMales: values.initialMales,
        initialFemales: values.initialFemales,
        initialBabies: values.initialBabies,
      });
      window.dispatchEvent(new CustomEvent('cuy:data-changed'));
      toast.add({
        type: "success",
        description: "El corral ha sido guardado.",
      })
    } catch (error) {
      console.error('error: ', error);
      toast.add({
        type: "error",
        description: "Ocurrió un error al guardar el corral.",
        priority: "high",
      })
    } finally {
      closeDialog()
      reset()
    }
  }

  return (
    <Dialog open={isOpenDialog}>
      <DialogTrigger render={() => (
        <Button type='button' className='capitalize' onClick={openDialog}>nuevo corral</Button>
      )} />
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className='capitalize'>nuevo corral</DialogTitle>
            <DialogDescription>
              Registra un corral nuevo recién adquirido o no registrado antes en el sistema con los
              valores actuales
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <FieldSet>
              <Field>
                <FieldLabel htmlFor="yard-name" className={cn('capitalize', errors.name && 'text-destructive')}>nombre de corral</FieldLabel>
                <InputGroup className={errors.name ? 'border-destructive' : ''}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="yard-name"
                        placeholder="Corral 1"
                        required
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </InputGroup>
                {errors.name && (
                  <FieldDescription className="text-destructive">
                    {errors.name.message}
                  </FieldDescription>
                )}
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="initial-males" className={cn('capitalize', errors.initialMales && 'text-destructive')}>machos</FieldLabel>
                  <InputGroup className={errors.initialMales ? 'border-destructive' : ''}>
                    <Controller
                      name="initialMales"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="initial-males"
                          placeholder="0"
                          inputMode="numeric"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      )}
                    />
                  </InputGroup>
                  {errors.initialMales && (
                    <FieldDescription className="text-destructive">
                      {errors.initialMales.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="initial-females" className={cn('capitalize', errors.initialFemales && 'text-destructive')}>hembras</FieldLabel>
                  <InputGroup className={errors.initialFemales ? 'border-destructive' : ''}>
                    <Controller
                      name="initialFemales"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="initial-females"
                          placeholder="0"
                          inputMode="numeric"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      )}
                    />
                  </InputGroup>
                  {errors.initialFemales && (
                    <FieldDescription className="text-destructive">
                      {errors.initialFemales.message}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="initial-babies" className={cn('capitalize', errors.initialBabies && 'text-destructive')}>crías</FieldLabel>
                  <InputGroup className={errors.initialBabies ? 'border-destructive' : ''}>
                    <Controller
                      name="initialBabies"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="initial-babies"
                          placeholder="0"
                          inputMode="numeric"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        />
                      )}
                    />
                  </InputGroup>
                  {errors.initialBabies && (
                    <FieldDescription className="text-destructive">
                      {errors.initialBabies.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>
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

export default YardForm;
