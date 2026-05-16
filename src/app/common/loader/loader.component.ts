import { Component, Input } from '@angular/core';
import { BASE_MODULE_IMPORTS } from '../base_modules_imports';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  imports: [...BASE_MODULE_IMPORTS],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  @Input() isLoading = false;
  @Input() message = 'Loading...';

  constructor(public loaderService: LoaderService) { }
}
