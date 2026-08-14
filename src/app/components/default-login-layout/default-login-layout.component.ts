import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-default-login-layout',
  templateUrl: './default-login-layout.component.html',
  styleUrls: ['./default-login-layout.component.css']
})



export class DefaultLoginLayoutComponent {  
  @Input() title:             string = "";
  @Input() primaryBtnText:    string = "";
  @Input() secondaryBtnText:  string = "";
  @Input() disablePrimaryBtn: boolean = true;

  //Passar os valores de tela
  @Output("submit")   onSubmit    = new EventEmitter();
  @Output("navigate") onNavigate  = new EventEmitter();

  submit(){
    //Precisa ser escutado no componente login.html e login.ts
    this.onSubmit.emit();
  }  
  navigate(){
    //Precisa ser escutado no componente login.html e login.ts
    this.onNavigate.emit();
  }

}
