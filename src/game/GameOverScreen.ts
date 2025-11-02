export class GameOverScreen {
  private restartGameCallback: () => void;
  private canvas: HTMLCanvasElement;

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
    
    // Draw restart button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = canvasWidth / 2 - buttonWidth / 2;
    const buttonY = canvasHeight / 2 + 70;

    ctx.fillStyle = '#4CAF50'; // Green button
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Restart', canvasWidth / 2, buttonY + buttonHeight / 2 + 8); // Center text vertically

    // Add event listener for restart button
    if (!this.canvas.onclick) { // Prevent adding multiple listeners
      this.canvas.onclick = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
          this.restartGameCallback();
          this.canvas.onclick = null; // Remove listener after click
        }
      };
    }
  }

  clearClickListener() {
    this.canvas.onclick = null;
  }
}