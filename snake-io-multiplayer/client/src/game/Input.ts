import { Camera } from './Camera';

export class Input {
  private canvas: HTMLCanvasElement;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private touchX: number = 0;
  private touchY: number = 0;
  private isTouching: boolean = false;
  private boostActive: boolean = false;
  private isMobile: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    this.setupMouseListeners();
    this.setupTouchListeners();
    this.setupKeyboardListeners();
    this.setupMobileControls();
  }

  private setupMouseListeners(): void {
    // Track mouse position
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Mouse click for boost
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.boostActive = true;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.boostActive = false;
      }
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private setupTouchListeners(): void {
    // Touch everywhere on screen
    const touchZone = this.canvas;
    
    // Prevent default touch actions (scrolling)
    document.body.addEventListener('touchstart', (e) => {
       if (e.target === this.canvas || e.target === document.getElementById('mobileControls')) {
         e.preventDefault();
       }
    }, { passive: false });

    touchZone.addEventListener('touchstart', (e) => {
      // e.preventDefault(); // Handled by body listener
      this.isTouching = true;
      const touch = e.touches[0];
      this.touchX = touch.clientX;
      this.touchY = touch.clientY;
    }, { passive: false });

    touchZone.addEventListener('touchmove', (e) => {
      // e.preventDefault();
      if (!this.isTouching) return;
      const touch = e.touches[0];
      this.touchX = touch.clientX;
      this.touchY = touch.clientY;
    }, { passive: false });

    touchZone.addEventListener('touchend', () => {
      this.isTouching = false;
    });
    
    touchZone.addEventListener('touchcancel', () => {
      this.isTouching = false;
    });

    // Also listen on mobileControls layer
    const mobileControls = document.getElementById('mobileControls');
    if (mobileControls) {
        mobileControls.addEventListener('touchstart', (e) => {
            this.isTouching = true;
            const touch = e.touches[0];
            this.touchX = touch.clientX;
            this.touchY = touch.clientY;
        });

        mobileControls.addEventListener('touchmove', (e) => {
            if (!this.isTouching) return;
            const touch = e.touches[0];
            this.touchX = touch.clientX;
            this.touchY = touch.clientY;
        });

        mobileControls.addEventListener('touchend', () => {
            this.isTouching = false;
        });
    }
  }

  private setupKeyboardListeners(): void {
    // Space for boost
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.boostActive = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.boostActive = false;
      }
    });
  }

  private setupMobileControls(): void {
    const boostButton = document.getElementById('boostButton');
    if (!boostButton) return;

    boostButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.boostActive = true;
    });

    boostButton.addEventListener('touchend', () => {
      this.boostActive = false;
    });

    boostButton.addEventListener('touchcancel', () => {
      this.boostActive = false;
    });
  }

  getDirection(camera: Camera): number {
    let targetX: number;
    let targetY: number;

    const viewport = camera.getViewport();
    
    // Get center of screen (player head position)
    const centerX = viewport.x + viewport.width / 2;
    const centerY = viewport.y + viewport.height / 2;

    if (this.isMobile && this.isTouching) {
      // Calculate angle from center of screen to touch point
      // Touch coordinates are screen coordinates (0,0 is top-left of canvas)
      // We need to convert screen center to screen coordinates for comparison
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      
      const dx = this.touchX - screenCenterX;
      const dy = this.touchY - screenCenterY;
      
      return Math.atan2(dy, dx);
    }

    // Use mouse position
    targetX = this.mouseX + viewport.x;
    targetY = this.mouseY + viewport.y;

    const dx = targetX - centerX;
    const dy = targetY - centerY;

    return Math.atan2(dy, dx);
  }

  isBoosting(): boolean {
    return this.boostActive;
  }

  getMousePosition(): { x: number; y: number } {
    return { x: this.mouseX, y: this.mouseY };
  }
  
  getTouchPosition(): { x: number; y: number } | null {
    if (!this.isTouching) return null;
    return { x: this.touchX, y: this.touchY };
  }
}
