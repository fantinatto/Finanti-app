import { Component, forwardRef, Input  } from '@angular/core';
import { NG_VALUE_ACCESSOR } from "@angular/forms";

type InputTypes = "text" | "email" | "password"

@Component({
  selector: 'app-primary-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PrimaryInputComponent),
      multi: true
    }
  ],
  templateUrl: './primary-input.component.html',
  styleUrls: ['./primary-input.component.css']
})
export class PrimaryInputComponent {

  @Input() type:        InputTypes = "text";
  @Input() placeholder: string = "";
  @Input() label:       string = "";
  @Input() inputName:   string = "";
  @Input() errorMessage: string | null = null;

  value: string = '';
  OnChange: any = () => {};
  OnTouched: any = () => {};

  onInput(event: Event){
    const value = (event.target as HTMLInputElement).value;
    this.OnChange(value);
  }

  writeValue(obj: any): void {
    this.value = this.value;
  }

  registerOnChange(fn: any): void {
    this.OnChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    
  }
  
  registerOnTouched(fn: any): void {
    this.OnTouched = fn;
  }


}
