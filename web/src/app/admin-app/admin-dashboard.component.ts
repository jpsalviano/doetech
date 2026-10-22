import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Painel Administrativo</h1>
        <p>Bem-vindo ao sistema de administração do DoeTech</p>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <div class="card-icon">
              <i class="bi bi-people"></i>
            </div>
            <div class="card-content">
              <h3>Gerenciar Sistema</h3>
              <p>Visualize usuários e doações do sistema</p>
              <a routerLink="/admin/panel" class="btn btn-primary">
                Acessar
              </a>
            </div>
          </div>
        </div>

        <div class="dashboard-info">
          <h2>Funcionalidades Disponíveis</h2>
          <ul>
            <li><strong>Usuários:</strong> Visualize todos os usuários registrados e suas contas associadas</li>
            <li><strong>Doações:</strong> Acompanhe todas as doações em andamento no sistema</li>
          </ul>
          
          <div class="info-note">
            <i class="bi bi-info-circle"></i>
            <p>Este painel administrativo oferece acesso somente leitura aos dados do sistema para fins de monitoramento e suporte.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      color: var(--text-color-secondary);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .dashboard-card {
      background: var(--bg-color-card);
      border: 2px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .dashboard-card:hover {
      border-color: var(--primary-color);
      box-shadow: var(--box-shadow-sm);
    }

    .card-icon {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .card-content h3 {
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .card-content p {
      color: var(--text-color-secondary);
      margin-bottom: 1.5rem;
    }

    .dashboard-info {
      background: var(--bg-color-light);
      border-radius: 0.5rem;
      padding: 2rem;
    }

    .dashboard-info h2 {
      color: var(--primary-color);
      margin-bottom: 1.5rem;
    }

    .dashboard-info ul {
      list-style: none;
      padding: 0;
      margin-bottom: 2rem;
    }

    .dashboard-info li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .dashboard-info li:last-child {
      border-bottom: none;
    }

    .info-note {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--info-background);
      border: 1px solid var(--info-border);
      border-radius: 0.5rem;
      padding: 1rem;
      color: var(--info-color);
    }

    .info-note i {
      font-size: 1.5rem;
    }

    .info-note p {
      margin: 0;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 1rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .dashboard-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class AdminDashboardComponent {}
