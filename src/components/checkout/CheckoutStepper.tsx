'use client';

import React from 'react';

type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'confirmation';

const STEPS = [
  { key: 'cart',         label: 'Panier',       sub: 'Vérification' },
  { key: 'delivery',     label: 'Informations', sub: 'Adresse & contact' },
  { key: 'payment',      label: 'Paiement',     sub: 'Mode de paiement' },
  { key: 'confirmation', label: 'Confirmation', sub: 'Commande validée' },
] as const;

const STEP_ORDER: CheckoutStep[] = ['cart', 'delivery', 'payment', 'confirmation'];

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '24px',
      background: '#0A0A0A',
      borderRadius: '12px',
      marginBottom: '24px'
    }}>
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isDisabled = index > currentIndex;
        
        return (
          <React.Fragment key={step.key}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isDisabled ? 0.4 : 1
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isCompleted ? '#10B981' : isActive ? '#D4A24E' : '#333',
                color: isCompleted || isActive ? '#000' : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>
              
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isActive ? '#D4A24E' : isCompleted ? '#10B981' : '#888'
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#666'
                }}>
                  {step.sub}
                </div>
              </div>
            </div>
            
            {index < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: isCompleted ? '#10B981' : '#333',
                borderRadius: '1px',
                minWidth: '40px'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { STEP_ORDER, type CheckoutStep };