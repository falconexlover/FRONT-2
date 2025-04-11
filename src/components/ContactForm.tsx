import React, { useState } from 'react';
import styled from 'styled-components';
import ActionButton from './ui/ActionButton';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    // TODO: Реализовать логику отправки формы (например, через API)
    console.log('Отправка данных:', formData);
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setIsSubmitting(false);
    setSubmitMessage('Сообщение успешно отправлено!'); 
    setFormData({ name: '', email: '', message: '' }); // Очистка формы
     // Можно добавить скрытие сообщения через время
    // setTimeout(() => setSubmitMessage(''), 5000);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="name">Ваше имя</Label>
        <Input 
          type="text" 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="email">Ваш Email</Label>
        <Input 
          type="email" 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="message">Сообщение</Label>
        <TextArea 
          id="message" 
          name="message" 
          value={formData.message} 
          onChange={handleChange} 
          required 
          disabled={isSubmitting}
        />
      </FormGroup>
      <ActionButton type="submit" className="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
      </ActionButton>
      {submitMessage && <p style={{ color: 'var(--primary-color)', marginTop: '1rem' }}>{submitMessage}</p>}
    </Form>
  );
};

export default ContactForm; 