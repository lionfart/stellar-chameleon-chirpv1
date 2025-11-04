export class GameWinScreen {
  private restartGameCallback: () => void;
  private canvas: HTMLCanvasElement;

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
    
    // Draw restart button
    const buttonWidth = 250;
    const buttonHeight = 70;
    const buttonX = canvasWidth / 2 - buttonWidth / 2;
    const buttonY = canvasHeight / 2 + 100;

    ctx.fillStyle = '#4CAF50'; // Green button
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Restart Game', canvasWidth / 2, buttonY + buttonHeight / 2 + 10); // Center text vertically

    // Add event listener for restart button
    // `if (!this.canvas.onclick)` koşulunu kaldırıyoruz, böylece dinleyici her zaman ayarlanır.
    this.canvas.onclick = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
          mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
        this.restartGameCallback();
      }
    };
  }

  clearClickListener() {
    this.canvas.onclick = null;
  }
}