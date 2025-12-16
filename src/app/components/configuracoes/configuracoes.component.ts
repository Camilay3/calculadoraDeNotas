import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [TuiButton, RouterLink],
  templateUrl: './configuracoes.component.html',
})
export class ConfiguracoesComponent {

}
