// src/app/shared/animations/chat-dialog.animations.ts
import { trigger, state, style, transition, animate } from '@angular/animations';

export const chatDialogAnimations = [
  trigger('dialogAnimation', [
    state('void', style({
      transform: 'scale(0.7)',
      opacity: 0
    })),
    state('*', style({
      transform: 'scale(1)',
      opacity: 1
    })),
    transition('void => *', [
      animate('150ms ease-out')
    ]),
    transition('* => void', [
      animate('150ms ease-in')
    ])
  ])
];