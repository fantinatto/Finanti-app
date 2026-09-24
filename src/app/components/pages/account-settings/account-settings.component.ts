import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserProfile } from '../../../interfaces/user.interfaces';

type AbaSettings = 'perfil' | 'carteira';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})
export class AccountSettingsComponent implements OnInit {
  abaAtiva: AbaSettings = 'perfil';

  perfil: UserProfile | null = null;

  displayName = '';
  avatarUrl = '';
  birthDate = ''; // yyyy-MM-dd, formato do <input type="date">

  carregando = false;
  salvando = false;
  salvoComSucesso = false;
  erro = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.carregarPerfil();
  }

  setAba(aba: AbaSettings): void {
    this.abaAtiva = aba;
  }

  carregarPerfil(): void {
    this.carregando = true;
    this.userService.getProfile().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.displayName = perfil.displayName;
        this.avatarUrl = perfil.avatarUrl ?? '';
        this.birthDate = perfil.birthDate ? perfil.birthDate.substring(0, 10) : '';
        this.carregando = false;
      },
      error: () => { this.carregando = false; },
    });
  }

  salvar(): void {
    this.salvando = true;
    this.salvoComSucesso = false;
    this.erro = '';

    this.userService.updateProfile({
      displayName: this.displayName,
      avatarUrl: this.avatarUrl || undefined,
      birthDate: this.birthDate || undefined,
    }).subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.salvando = false;
        this.salvoComSucesso = true;
      },
      error: () => {
        this.salvando = false;
        this.erro = 'Não foi possível salvar as alterações. Tente novamente.';
      },
    });
  }
}
