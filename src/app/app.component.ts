import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService, ApiResponse } from './services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'PharmacyManagement';
  name = 'Angular Developer';
  testResponse = signal<ApiResponse<string> | null>(null);

  constructor(private api: ApiService) {
    this.loadTest();
  }

  loadTest() {
    this.api.getTest().subscribe({
      next: (res) => this.testResponse.set(res),
      error: (err) => console.error(err)
    });
  }
}