import { Component } from '@angular/core';
import {  RouterOutlet } from "@angular/router";
import { TuiRoot } from '@taiga-ui/core';
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, TuiRoot, NavBarComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {}
