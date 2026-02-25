import { 
  SKIN_COLORS, 
  SKIN_PATTERNS, 
  SnakeSkin, 
  SkinPattern,
  SkinColor 
} from '../../../shared/types';

const PATTERN_LABELS: Record<SkinPattern, string> = {
  solid: 'Solid',
  gradient: 'Gradient',
  striped: 'Striped',
  dotted: 'Dotted',
  neon: 'Neon',
  rainbow: 'Rainbow',
  camo: 'Camo',
  galaxy: 'Galaxy'
};

export class SkinSelector {
  private selectedColorIndex: number = 0;
  private selectedPattern: SkinPattern = 'gradient';
  private previewCanvas: HTMLCanvasElement;
  private previewCtx: CanvasRenderingContext2D;
  
  constructor() {
    this.previewCanvas = document.getElementById('skinPreview') as HTMLCanvasElement;
    this.previewCtx = this.previewCanvas.getContext('2d')!;
    
    this.initializeColorPicker();
    this.initializePatternPicker();
    this.updatePreview();
  }
  
  private initializeColorPicker(): void {
    const container = document.getElementById('colorPicker');
    if (!container) return;
    
    container.innerHTML = '';
    
    SKIN_COLORS.forEach((color, index) => {
      const btn = document.createElement('button');
      btn.className = `color-option${index === this.selectedColorIndex ? ' selected' : ''}`;
      btn.style.background = `rgb(${color.primary.r}, ${color.primary.g}, ${color.primary.b})`;
      btn.title = color.name;
      
      btn.addEventListener('click', () => {
        this.selectedColorIndex = index;
        this.updateColorSelection();
        this.updatePreview();
      });
      
      container.appendChild(btn);
    });
  }
  
  private initializePatternPicker(): void {
    const container = document.getElementById('patternPicker');
    if (!container) return;
    
    container.innerHTML = '';
    
    SKIN_PATTERNS.forEach((pattern) => {
      const btn = document.createElement('button');
      btn.className = `pattern-option${pattern === this.selectedPattern ? ' selected' : ''}`;
      btn.textContent = PATTERN_LABELS[pattern];
      btn.dataset.pattern = pattern;
      
      btn.addEventListener('click', () => {
        this.selectedPattern = pattern;
        this.updatePatternSelection();
        this.updatePreview();
      });
      
      container.appendChild(btn);
    });
  }
  
  private updateColorSelection(): void {
    const options = document.querySelectorAll('.color-option');
    options.forEach((opt, index) => {
      opt.classList.toggle('selected', index === this.selectedColorIndex);
    });
  }
  
  private updatePatternSelection(): void {
    const options = document.querySelectorAll('.pattern-option');
    options.forEach((opt) => {
      const optElement = opt as HTMLElement;
      opt.classList.toggle('selected', optElement.dataset.pattern === this.selectedPattern);
    });
  }
  
  private updatePreview(): void {
    const canvas = this.previewCanvas;
    const ctx = this.previewCtx;
    const color = SKIN_COLORS[this.selectedColorIndex];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake preview with 8 segments
    const segmentCount = 8;
    const segmentRadius = 12;
    const spacing = (canvas.width - segmentRadius * 2) / (segmentCount - 1);
    const centerY = canvas.height / 2;
    
    for (let i = segmentCount - 1; i >= 0; i--) {
      const x = segmentRadius + i * spacing;
      const t = i / segmentCount;
      
      this.drawSegment(ctx, x, centerY, segmentRadius, color, t);
    }
    
    // Draw eyes on head
    this.drawEyes(ctx, segmentRadius, centerY, segmentRadius);
  }
  
  private drawSegment(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    radius: number,
    color: SkinColor,
    t: number
  ): void {
    const { primary, secondary } = color;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    switch (this.selectedPattern) {
      case 'solid':
        ctx.fillStyle = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
        break;
        
      case 'gradient': {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgb(${primary.r}, ${primary.g}, ${primary.b})`);
        grad.addColorStop(1, `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`);
        ctx.fillStyle = grad;
        break;
      }
      
      case 'striped': {
        const stripe = Math.floor(t * 8) % 2 === 0;
        const c = stripe ? primary : secondary;
        ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
        break;
      }
      
      case 'dotted': {
        ctx.fillStyle = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
        ctx.fill();
        // Add dot
        if (t < 0.9) {
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`;
        }
        break;
      }
      
      case 'neon': {
        ctx.shadowColor = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgb(${primary.r}, ${primary.g}, ${primary.b})`;
        break;
      }
      
      case 'rainbow': {
        const hue = (t * 360 + Date.now() / 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        break;
      }
      
      case 'camo': {
        const camoColors = [primary, secondary, { r: 50, g: 50, b: 50 }];
        const c = camoColors[Math.floor(t * 3) % 3];
        ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
        break;
      }
      
      case 'galaxy': {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(${primary.r}, ${primary.g}, ${primary.b}, 1)`);
        grad.addColorStop(0.5, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.8)`);
        grad.addColorStop(1, 'rgba(0, 0, 30, 0.9)');
        ctx.fillStyle = grad;
        break;
      }
    }
    
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  private drawEyes(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    const eyeOffset = radius * 0.4;
    const eyeRadius = radius * 0.25;
    const pupilRadius = eyeRadius * 0.5;
    
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + eyeOffset + 2, y - eyeOffset, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeOffset + 2, y + eyeOffset, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  getSkin(): SnakeSkin {
    return {
      pattern: this.selectedPattern,
      colorIndex: this.selectedColorIndex
    };
  }
}
