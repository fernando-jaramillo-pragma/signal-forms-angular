import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

interface SignUpForm {
  username: string;
  email: string;
}

/**
 * Validador personalizado que verifica que el nombre de usuario cumpla con ciertos criterios:
 * - Solo debe contener caracteres alfanuméricos (letras y números).
 * - La longitud debe estar entre 3 y 20 caracteres.
 */
function usernameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) {
    return null; // La validación de requerido se maneja por separado
  }

  // Solo debe contener caracteres alfanuméricos (letras y números)
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return {
      usernameInvalid: 'Solo debe contener letras y números',
    };
  }

  // La longitud debe estar entre 3 y 20 caracteres
  if (value.length < 3 || value.length > 20) {
    return {
      usernameInvalid: 'Debe tener entre 3 y 20 caracteres',
    };
  }

  return null;
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  /**
   * Signal para controlar la visibilidad de la alerta de éxito
   */
  protected showSuccessAlert = signal(false);

  /**
   * Signal para almacenar los datos enviados
   */
  protected submittedData = signal<SignUpForm | null>(null);

  /**
   * Definición del formulario reactivo con validaciones
   */
  protected form: FormGroup;

  constructor(private fb: FormBuilder) {
    // Crear el formulario con validaciones
    this.form = this.fb.group({
      username: ['', [Validators.required, usernameValidator]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Obtiene el mensaje de error para el campo de nombre de usuario
   * según las validaciones aplicadas
   */
  protected getUsernameError(): string {
    const usernameControl = this.form.get('username');

    if (!usernameControl || !usernameControl.errors) {
      return '';
    }

    if (usernameControl.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (usernameControl.errors['usernameInvalid']) {
      return usernameControl.errors['usernameInvalid'];
    }

    return '';
  }

  /**
   * Obtiene el mensaje de error para el campo de email
   * según las validaciones aplicadas
   */
  protected getEmailError(): string {
    const emailControl = this.form.get('email');

    if (!emailControl || !emailControl.errors) {
      return '';
    }

    if (emailControl.errors['required']) {
      return 'El email es obligatorio';
    }

    if (emailControl.errors['email']) {
      return 'Ingrese un email válido';
    }

    return '';
  }

  /**
   * Maneja el envío del formulario reactivo
   */
  protected async onSubmit(event: Event) {
    event?.preventDefault();

    // Marcar todos los campos como tocados para mostrar errores
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value as SignUpForm;

    // Simular una llamada al servidor
    console.log('Enviando formulario:', formData);

    // Aquí puedes hacer tu llamada HTTP real
    // const result = await this.http.post('/api/register', formData);

    // Simular una respuesta exitosa
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Guardar datos enviados y mostrar alerta
    this.submittedData.set(formData);
    this.showSuccessAlert.set(true);

    // Resetear el formulario
    this.form.reset({
      username: '',
      email: '',
    });

    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
      this.showSuccessAlert.set(false);
    }, 5000);
  }

  /**
   * Cierra la alerta de éxito manualmente
   */
  protected closeAlert() {
    this.showSuccessAlert.set(false);
  }
}
