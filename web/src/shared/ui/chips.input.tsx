'use client';

import React, { useState, KeyboardEvent, useId } from 'react';

export interface ChipsInputProps {
  readonly values: string[];
  readonly onChange: (values: string[]) => void;
  readonly suggestions?: string[];
  readonly placeholder?: string;
  readonly label?: string;
  readonly helperText?: string;
  readonly inputStyle?: React.CSSProperties;
}

export default function ChipsInput({
  values = [],
  onChange,
  suggestions = [],
  placeholder = 'Ajouter un badge…',
  label = 'Badges personnalisés',
  helperText,
  inputStyle,
}: ChipsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputId = useId();

  const addChip = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputValue('');
  };

  const removeChip = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleSuggestion = (badge: string) => {
    if (values.includes(badge)) {
      onChange(values.filter((v) => v !== badge));
    } else {
      onChange([...values, badge]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && values.length > 0) {
      e.preventDefault();
      removeChip(values.length - 1);
    }
  };

  const availableSuggestions = suggestions.filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor={inputId} style={{ fontSize: '11px', color: '#9A7A5A', fontWeight: 500 }}>
            {label}
            {helperText && (
              <span style={{ color: '#5A4A3A', marginLeft: '4px', fontWeight: 400 }}>
                {helperText}
              </span>
            )}
          </label>
        </div>
      )}

      {/* Selected Chips & Input Container */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          background: '#0F0A06',
          border: '1px solid #1E1208',
          borderRadius: '6px',
          minHeight: '38px',
          ...inputStyle,
        }}
      >
        {values.map((chip, idx) => (
          <span
            key={`${chip}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: 'rgba(212, 162, 90, 0.15)',
              border: '1px solid rgba(212, 162, 90, 0.4)',
              borderRadius: '9999px',
              color: '#F4EADB',
              fontSize: '11px',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            <span>{chip}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(idx);
              }}
              aria-label={`Supprimer le badge ${chip}`}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#D4A25A',
                cursor: 'pointer',
                fontSize: '13px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '2px',
                opacity: 0.8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
            >
              ×
            </button>
          </span>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '120px' }}>
          <input
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) {
                addChip(inputValue);
              }
            }}
            placeholder={values.length === 0 ? placeholder : 'Ajouter un autre…'}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F4EADB',
              fontSize: '12px',
              width: '100%',
              padding: '2px 0',
            }}
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addChip(inputValue)}
              style={{
                background: '#D4A25A',
                border: 'none',
                borderRadius: '4px',
                color: '#0A0603',
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                cursor: 'pointer',
                marginLeft: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Suggested Chips from existing table / data */}
      {availableSuggestions.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: '#7A6A5A', display: 'block', marginBottom: '4px' }}>
            Valeurs existantes / Suggestions (cliquez pour activer) :
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {availableSuggestions.map((suggestion) => {
              const isSelected = values.includes(suggestion);
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => toggleSuggestion(suggestion)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isSelected ? 'rgba(212, 162, 90, 0.25)' : '#160C05',
                    border: `1px solid ${isSelected ? '#D4A25A' : '#2A1A0A'}`,
                    color: isSelected ? '#F4EADB' : '#9A7A5A',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <span>{isSelected ? '✓ ' : '+ '}{suggestion}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
