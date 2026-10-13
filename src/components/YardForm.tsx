import { Button } from "./ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "./ui/field"
import { Input } from "./ui/input"

const YardForm = () => {
  return (
<dialog
    id="yard-dialog"
    class="absolute top-1/2 left-1/2 -translate-1/2 p-4 rounded-2xl border w-80 md:w-96 min-h-80 md:min-h-auto"
>
    <Button
        type="button"
        variant='ghost'
        size='icon'
        commandfor="yard-dialog"
        command="close"
        className='absolute top-2 right-2'
    >X</Button>
    <form class="size-full flex flex-col gap-2">
        <FieldGroup>
            <FieldSet>
                <FieldLegend>Nuevo Corral</FieldLegend>
            <FieldDescription>Registra un corral nuevo recién adquirido o no registrado antes en el sistema con los valores actuales</FieldDescription>
                <Field>
                    <FieldLabel htmlFor="yard-name">
                        Nombre de corral
                    </FieldLabel>
                    <Input
                        id="yard-name"
                        placeholder="Corral 1"
                        required
                    />
                </Field>
                <div class="grid grid-cols-3 gap-4">
                    <Field>
                        <FieldLabel htmlFor="initial-males">Machos</FieldLabel>
                        <Input id="initial-males" type="number" placeholder="0" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="initial-females">Hembras</FieldLabel>
                        <Input id="initial-females" type="number" placeholder="0" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="initial-babies">Crías</FieldLabel>
                        <Input id="initial-babies" type="number" placeholder="0" />
                    </Field>
                </div>
            </FieldSet>
            <Field orientation="horizontal">
              <Button type="submit">Guardar</Button>
              <Button variant="outline" type="button" commandfor="yard-dialog" command="close">Cancelar</Button>
            </Field>
        </FieldGroup>
    </form>
</dialog>
    
  )
}

export default YardForm
