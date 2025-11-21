import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/services/api/usersAPI';
import { validateEmail, validatePhone, validateName } from '@/utils/validators';
import './ClientForm.css';

interface ClientFormProps {
  onSubmit: (data: { name: string; email: string; phone: string; notes?: string }) => void;
  onBack: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onBack }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) {
        setName(userProfile.displayName);
      }
      if (userProfile.email) {
        setEmail(userProfile.email);
      }
      if (userProfile.phone) {
        setPhone(userProfile.phone);
      }
    } else if (user) {
      if (user.displayName) {
        setName(user.displayName);
      }
      if (user.email) {
        setEmail(user.email);
      }
    }
  }, [user, userProfile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(name)) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!validatePhone(phone)) {
      newErrors.phone = 'Ingresa un teléfono válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (user && userProfile) {
        const updates: any = {};
        if (name !== userProfile.displayName) {
          updates.displayName = name;
        }
        if (phone !== userProfile.phone) {
          updates.phone = phone;
        }
        if (Object.keys(updates).length > 0) {
          try {
            await usersAPI.updateUser(user.uid, updates);
            await refreshProfile();
          } catch (error) {
            console.error('Error al actualizar perfil:', error);
          }
        }
      }
      onSubmit({ name, email, phone, notes });
    }
  };

  return (
    <div className="client-form">
      <h2 className="section-title">Tus Datos</h2>
      <form onSubmit={handleSubmit} className="form">
        <Input
          label="Nombre Completo"
          value={name}
          onChange={setName}
          placeholder="Juan Pérez"
          error={errors.name}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="juan@ejemplo.com"
          error={errors.email}
          required
        />
        <Input
          label="Teléfono"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+56 9 1234 5678"
          error={errors.phone}
          required
        />
        <div className="input-wrapper">
          <label className="input-label">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguna preferencia o comentario adicional..."
            className="textarea-field"
            rows={4}
          />
        </div>
        <div className="navigation-buttons">
          <Button variant="outline" type="button" onClick={onBack}>
            Volver
          </Button>
          <Button type="submit" fullWidth>
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
};
