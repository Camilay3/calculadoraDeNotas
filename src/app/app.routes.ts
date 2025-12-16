import { Routes } from '@angular/router';
import { ConfiguracoesComponent } from './components/configuracoes/configuracoes.component';
import { CalculadoraComponent } from './components/calculadora/calculadora.component';

export const routes: Routes = [
    { path: '', component: CalculadoraComponent },
    { path: 'configurar', component: ConfiguracoesComponent },
    { path: '**', redirectTo: '' },
];
