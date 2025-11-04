export class GameOverScreen {
  private restartGameCallback: () => void;
  private canvas: HTMLCanvasElement;
  private isListenerActive: boolean = false;

  constructor(restartGameCallback: () => void, canvas: HTMLCanvasElement) {
    this.restartGameCallback = restartGameCallback;
    this.canvas = canvas;
  }

  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2);
  }

  // Olay dinleyicisini etkinleştirme artık düğme olmadığı için gerekli değil
  activate() {
    // Düğme kaldırıldığı için bu metodun içeriği boş bırakıldı.
    // Dinleyici eklenmeyecek.
  }

  clearClickListener() {
    this.canvas.onclick = null;
    this.isListenerActive = false;
  }
}