export class GameWinScreen {
  private restartGameCallback: () => void;
  private canvas: HTMLCanvasElement;
  private isListenerActive: boolean = false;

  constructor(restartGameCallback: () => void, canvas: HTMLCanvasElement) {
    this.restartGameCallback = restartGameCallback;
    this.canvas = canvas;
  }

  draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'gold';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvasWidth / 2, canvasHeight / 2 - 50);
    ctx.font = '36px Arial';
    ctx.fillText('Princess Simge Rescued!', canvasWidth / 2, canvasHeight / 2 + 10);
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