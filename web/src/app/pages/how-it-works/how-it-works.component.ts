import { Component } from '@angular/core';
import { HowItWorksModalComponent } from './how-it-works-modal.component';

@Component({
  selector: 'app-how-it-works',
  imports: [HowItWorksModalComponent],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css'
})
export class HowItWorksComponent {
  modalOpen = false;
  modalPage = 0;
  modalContent: Array<{ image: string; title: string; body: string }> = [];

  private modalPages = [
    {
      image: 'assets/about-side.jpg',
      title: 'DOANDO UM EQUIPAMENTO',
      body: `<p>Na DOE TECH, incentivamos a doação de equipamentos eletrônicos usados, como computadores, celulares e impressoras.</p>
      <p>Ao doar, você não apenas dá uma nova vida a esses dispositivos, mas também ajuda a promover a inclusão digital de pessoas em situação de vulnerabilidade.</p>
      <p>Cada equipamento doado é criteriosamente avaliado e preparado para ser entregue a quem realmente precisa.</p>
      <p>Com a sua contribuição, você faz parte de um movimento que busca reduzir o desperdício e transformar realidades. Junte-se a nós nessa causa e faça a diferença na vida de milhares de pessoas!</p>`
    },
    {
      image: 'assets/about-side.jpg',
      title: 'RECEBENDO UM EQUIPAMENTO',
      body: `<p>A reutilização de equipamentos eletrônicos é uma das maiores missões da DOE TECH.</p>
      <p>Nossos especialistas trabalham para garantir que cada dispositivo recebido seja reformado e preparado para um novo uso. Isso não apenas prolonga a vida útil dos produtos, mas também reduz a quantidade de lixo eletrônico gerado.</p>
      <p>Ao optar pela reutilização, você está contribuindo para a economia circular e ajudando a proteger o meio ambiente.</p>
      <p>Sua participação nesse processo é fundamental para criar um futuro mais sustentável, onde a tecnologia serve a todos de maneira justa e acessível.</p>`
    }
  ];

  openModal(page: number) {
    this.modalContent = this.modalPages;
    this.modalPage = page;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  setModalPage(page: number) {
    this.modalPage = page;
  }
}
