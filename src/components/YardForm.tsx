import { Button } from './ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field';
import { Input } from './ui/input';

const YardForm = () => {
  return (
    <dialog
      id="yard-dialog"
      className="absolute top-1/2 left-1/2 min-h-80 w-80 -translate-1/2 rounded-2xl border p-4 md:min-h-auto md:w-96"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        commandfor="yard-dialog"
        command="close"
        className="absolute top-2 right-2"
      >
        X
      </Button>
      <form className="flex size-full flex-col gap-2">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Nuevo Corral</FieldLegend>
            <FieldDescription>
              Registra un corral nuevo recién adquirido o no registrado antes en el sistema con los
              valores actuales
            </FieldDescription>
            <Field>
              <FieldLabel htmlFor="yard-name">Nombre de corral</FieldLabel>
              <Input id="yard-name" placeholder="Corral 1" required />
            </Field>
            <div className="grid grid-cols-3 gap-4">
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
            <Button variant="outline" type="button" commandfor="yard-dialog" command="close">
              Cancelar
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </dialog>
  );
};

export default YardForm;
