import { JsonPipe } from '@angular/common';
import { Component, computed, model, signal } from '@angular/core';

import {
  form,
  FormField,
  required,
  email,
  validate,
  FieldValidator,
  SchemaPath,
  submit,
} from '@angular/forms/signals';

interface SignUpForm {
  username: string;
  email: string;
}

/**
 * Esta función valida que el nombre de usuario cumpla con ciertos criterios:
 * - Solo debe contener caracteres alfanuméricos (letras y números).
 * - La longitud debe estar entre 3 y 20 caracteres.
 * @param field
 */
function usernameValidator(field: SchemaPath<string>) {
  validate(field, (ctx) => {
    // Obtener el valor del campo
    const value = ctx.value();

    if (!value) {
      return null; // La validación de requerido se maneja por separado
    }

    // Solo debe contener caracteres alfanuméricos (letras y números)
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return {
        kind: 'usernameInvalid', // Tipo de error personalizado
        message: 'Solo debe contener letras y números',
      };
    }

    // La longitud debe estar entre 3 y 20 caracteres
    if (value.length < 3 || value.length > 20) {
      return {
        kind: 'usernameInvalid', // Tipo de error personalizado
        message: 'Debe tener entre 3 y 20 caracteres',
      };
    }

    return null;
  });
}

@Component({
  selector: 'app-root',
  imports: [FormField, JsonPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  /**
   * Modelo de datos para el formulario de registro
   * por defecto los campos están vacíos y son signals
   */
  protected model = signal<SignUpForm>({
    username: '',
    email: '',
  });

  touched = model<boolean>(false);

  /**
   * Signal para controlar la visibilidad de la alerta de éxito
   */
  protected showSuccessAlert = signal(false);

  /**
   * Signal para almacenar los datos enviados
   */
  protected submittedData = signal<SignUpForm | null>(null);

  /**
   * Definición del formulario utilizando signal-forms
   * Se aplican las validaciones necesarias a cada campo
   */
  protected form = form(this.model, (s) => {
    required(s.username);
    required(s.email);
    email(s.email);
    usernameValidator(s.username); // Aplicar la validación personalizada definida arriba
  });

  /**
   * Obtiene el mensaje de error para el campo de nombre de usuario
   * según las validaciones aplicadas
   * Se muestran mensajes específicos para cada tipo de error en el html
   */
  protected getUsernameError = computed(() => {
    // Obtener los errores del campo de nombre de usuario
    const errors = this.form.username().errors();

    // Verificar si hay un error de requerido
    const required = errors.find((e) => e.kind === 'required');
    if (required) {
      return 'Este campo es obligatorio';
    }
    // Verificar si hay un error de validación personalizada
    const invalid = errors.find((e) => e.kind === 'usernameInvalid'); // tipo definido en usernameValidator en KIND
    if (invalid) {
      return invalid?.message;
    }
    // Si no hay errores, retornar cadena vacía
    return '';
  });

  /**
   * Obtiene el mensaje de error para el campo de email
   * según las validaciones aplicadas
   * Se muestran mensajes específicos para cada tipo de error en el html
   */
  protected getEmailError = computed(() => {
    // Obtener los errores del campo de email
    const errors = this.form.email().errors();

    // Verificar si hay un error de requerido
    const required = errors.find((e) => e.kind === 'required');
    if (required) {
      return 'El email es obligatorio';
    }

    // Verificar si hay un error de formato de email
    const email = errors.find((e) => e.kind === 'email');
    if (email) {
      return 'Ingrese un email válido';
    }
    // Si no hay errores, retornar cadena vacía
    return '';
  });

  /**
   * Maneja el envío del formulario usando la función submit de Angular Signals Forms
   */
  protected async onSubmit(event: Event) {
    event?.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    await submit(this.form, async (f) => {
      const formData = f().value();

      // Simular una llamada al servidor
      console.log('Enviando formulario:', formData);

      // Aquí puedes hacer tu llamada HTTP real
      // const result = await this.http.post('/api/register', formData);

      // Simular una respuesta exitosa (sin errores)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Si el servidor retorna errores, puedes devolverlos así:
      // return [{
      //   fieldTree: this.form.username,
      //   kind: 'server',
      //   message: 'Este nombre de usuario ya está en uso'
      // }];

      // Guardar datos enviados y mostrar alerta
      this.submittedData.set(formData);
      this.showSuccessAlert.set(true);

      // Resetear el formulario (esto también resetea el estado touched)
      this.model.set({
        username: '',
        email: '',
      });
      this.touched.set(false);

      // Ocultar la alerta después de 5 segundos
      setTimeout(() => {
        this.showSuccessAlert.set(false);
      }, 5000);

      return undefined; // Sin errores
    });
  }

  /**
   * Cierra la alerta de éxito manualmente
   */
  protected closeAlert() {
    this.showSuccessAlert.set(false);
  }
}
