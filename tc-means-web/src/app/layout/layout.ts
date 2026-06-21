import { Component } from '@angular/core';
import { Appbar } from './appbar/appbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Appbar],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
