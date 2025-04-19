import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appVirtualScroll]'
})
export class VirtualScrollDirective implements OnInit, OnChanges, OnDestroy {
  @Input() appVirtualScrollItems: any[] = [];
  @Input() appVirtualScrollItemHeight = 50;
  
  private observer: IntersectionObserver | null = null;
  private renderedItems: HTMLElement[] = [];
  private container: HTMLElement;
  private scrollHandler: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.container = el.nativeElement;
    this.scrollHandler = this.onScroll.bind(this);
  }

  ngOnInit() {
    this.setupContainer();
    this.initializeObserver();
    this.container.addEventListener('scroll', this.scrollHandler);
  }

  ngOnChanges() {
    if (this.container) {
      this.renderVisibleItems();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.container) {
      this.container.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private setupContainer() {
    this.renderer.setStyle(this.container, 'overflow-y', 'auto');
    this.renderer.setStyle(this.container, 'position', 'relative');
    this.renderer.setStyle(this.container, 'height', '100%');
    
    // Créer un conteneur fantôme pour la hauteur totale
    const totalHeight = this.appVirtualScrollItems.length * this.appVirtualScrollItemHeight;
    const phantomContainer = this.renderer.createElement('div');
    this.renderer.setStyle(phantomContainer, 'height', `${totalHeight}px`);
    this.renderer.setStyle(phantomContainer, 'position', 'absolute');
    this.renderer.setStyle(phantomContainer, 'width', '1px');
    this.renderer.setStyle(phantomContainer, 'top', '0');
    this.renderer.appendChild(this.container, phantomContainer);
  }

  private initializeObserver() {
    const options = {
      root: this.container,
      rootMargin: '200px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.renderVisibleItems();
      }
    }, options);

    // Observer le container lui-même
    this.observer.observe(this.container);
  }

  private onScroll() {
    this.renderVisibleItems();
  }

  private renderVisibleItems() {
    // Nettoyage des éléments précédents
    for (const item of this.renderedItems) {
      this.renderer.removeChild(this.container, item);
    }
    this.renderedItems = [];

    const containerHeight = this.container.clientHeight;
    const scrollTop = this.container.scrollTop;

    // Calculer quels éléments sont visibles
    const startIndex = Math.max(0, Math.floor(scrollTop / this.appVirtualScrollItemHeight) - 5);
    const endIndex = Math.min(
      this.appVirtualScrollItems.length - 1,
      Math.ceil((scrollTop + containerHeight) / this.appVirtualScrollItemHeight) + 5
    );

    // Rendre uniquement les éléments visibles
    for (let i = startIndex; i <= endIndex; i++) {
      const item = this.appVirtualScrollItems[i];
      if (item) {
        const element = this.renderer.createElement('div');
        this.renderer.setStyle(element, 'position', 'absolute');
        this.renderer.setStyle(element, 'top', `${i * this.appVirtualScrollItemHeight}px`);
        this.renderer.setStyle(element, 'height', `${this.appVirtualScrollItemHeight}px`);
        this.renderer.setStyle(element, 'width', '100%');
        
        // Contenu de l'élément (à personnaliser selon vos besoins)
        const content = this.renderer.createText(`Item ${i}: ${JSON.stringify(item)}`);
        this.renderer.appendChild(element, content);
        
        this.renderer.appendChild(this.container, element);
        this.renderedItems.push(element);
      }
    }
  }
}