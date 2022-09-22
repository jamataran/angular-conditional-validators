import { Component, OnInit } from '@angular/core';
import { AbstractControl, ValidatorFn, AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface BooleanFn {
  (): boolean;
}

/**
 * A conditional validator generator. Assigns a validator to the form control if the predicate function returns true on the moment of validation
 * @example
 * Here if the myCheckbox is set to true, the myEmailField will be required and also the text will have to have the word 'mason' in the end.
 * If it doesn't satisfy these requirements, the errors will placed to the dedicated `illuminatiError` namespace.
 * Also the myEmailField will always have `maxLength`, `minLength` and `pattern` validators.
 * ngOnInit() {
 *   this.myForm = this.fb.group({
 *    myCheckbox: [''],
 *    myEmailField: ['', [
 *       Validators.maxLength(250),
 *       Validators.minLength(5),
 *       Validators.pattern(/.+@.+\..+/),
 *       conditionalValidator(() => this.myForm.get('myCheckbox').value,
 *                            Validators.compose([
 *                            Validators.required,
 *                            Validators.pattern(/.*mason/)
 *         ]),
 *        'illuminatiError')
 *        ]]
 *     })
 * }
 * @param predicate
 * @param validator
 * @param errorNamespace optional argument that creates own namespace for the validation error
 */
export function conditionalValidator(predicate: BooleanFn,
                              validator: ValidatorFn,
                              errorNamespace?: string): ValidatorFn {
  return (formControl => {
    if (!formControl.parent) {
      return null;
    }
    let error = null;
    if (predicate()) {
      error = validator(formControl);
    }
    if (errorNamespace && error) {
      const customError = {};
      customError[errorNamespace] = error;
      error = customError
    }
    return error;
  })
}


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  myForm: FormGroup;
  constructor(private fb: FormBuilder) {
  }
  ngOnInit() {
    this.myForm = this.fb.group({
      myCheckbox: [''],
      myEmailField: ['', [
         Validators.maxLength(250),
         Validators.minLength(5),
         Validators.pattern(/.+@.+\..+/),
         conditionalValidator(() => this.myForm.get('myCheckbox').value, 
                              Validators.required,
                              'illuminatiError')
      ]]
    })
    this.myForm.get('myCheckbox').valueChanges
        .subscribe(value => {
            this.myForm.get('myEmailField').updateValueAndValidity();
        });
  }

  onSubmit() {
    console.log(this.myForm.value);
  }

}
