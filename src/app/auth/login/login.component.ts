import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private form = viewChild.required<NgForm>('form');
  private destroyRef = inject(DestroyRef);

  constructor() {
    /* We use afterNextRender for two reasons:
     1. In the template-driven approach, we need to wait for the template to render before the form is fully initialized.
     2. afterRender and afterNextRender are meant for operations that should only be executed on the client, not on the server.
        This makes them preferable to ngAfterViewInit in this context. */
    afterNextRender(() => {
      const formSubscription = this.form()
        .valueChanges?.pipe(
          /* The debounceTime operator delays the emission of values from the source Observable,
           discarding any values that arrive within the specified time frame.
           This prevents the subsequent function from being triggered while the user is still typing.
           Additionally, it improves performance by reducing the number of unnecessary operations during rapid user input. */
          debounceTime(500),
        )
        .subscribe({
          next: (value) =>
            window.localStorage.setItem(
              'saved-login-form',
              JSON.stringify({
                email: value.email,
              }),
            ),
        });

      this.destroyRef.onDestroy(() => formSubscription?.unsubscribe());
    });
  }

  onSubmit(formData: NgForm) {
    if (formData.invalid) {
      return;
    }
    const enteredEmail = formData.form.value.email;
    const enteredPassword = formData.form.value.password;
    console.log(enteredEmail, enteredPassword);

    formData.reset();
  }
}
