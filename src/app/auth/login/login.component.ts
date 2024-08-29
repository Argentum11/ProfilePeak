import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounce, debounceTime, of } from 'rxjs';

function mustContainNumber(control: AbstractControl) {
  const hasNumber = /\d/.test(control.value);

  if (hasNumber) {
    return null; // Valid
  }

  return { doesNotContainNumber: true }; // Invalid
}

function mustBeGmail(control: AbstractControl) {
  const isGmail = control.value.includes('@gmail.com');

  if (isGmail) {
    return of(null); // Valid
  }

  return of({ notGmail: true }); // Invalid
}

let initialEmail = '';
const savedForm = window.localStorage.getItem('saved-login-form');
if (savedForm) {
  const loadedForm = JSON.parse(savedForm);
  initialEmail = loadedForm.email;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private destoryRef = inject(DestroyRef);

  form = new FormGroup({
    email: new FormControl(initialEmail, {
      validators: [Validators.email, Validators.required],
      asyncValidators: [mustBeGmail],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        mustContainNumber,
      ],
    }),
  });

  get emailIsInvalid() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    );
  }

  get passwordIsInvalid() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
    );
  }

  onSubmit() {
    const enteredEmail = this.form.value.email;
    const enteredPassword = this.form.value.password;
    console.log(enteredEmail, enteredPassword);
  }

  ngOnInit(): void {
    const emailSubscription = this.form.valueChanges
      .pipe(debounceTime(500))
      .subscribe({
        next: (value) =>
          window.localStorage.setItem(
            'saved-login-form',
            JSON.stringify({ email: value.email }),
          ),
      });

    this.destoryRef.onDestroy(() => emailSubscription.unsubscribe());
  }
}
