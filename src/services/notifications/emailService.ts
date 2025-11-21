export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export const emailService = {
  async sendBookingConfirmation(data: {
    email: string;
    clientName: string;
    serviceName: string;
    professionalName: string;
    date: string;
    time: string;
    bookingId: string;
  }): Promise<void> {
    const emailData: EmailData = {
      to: data.email,
      subject: `Confirmación de Reserva - ${data.serviceName}`,
      body: `
        Hola ${data.clientName},
        
        Tu reserva ha sido confirmada:
        
        Servicio: ${data.serviceName}
        Profesional: ${data.professionalName}
        Fecha: ${data.date}
        Hora: ${data.time}
        ID de Reserva: ${data.bookingId}
        
        Te esperamos en La Tribu Salón y Barbería.
        
        Si necesitas cancelar o modificar tu reserva, contáctanos.
      `
    };

    console.log('Email de confirmación:', emailData);
    
    // TODO: Integrar con servicio de email (SendGrid, Mailgun, etc.)
    // Por ahora solo se registra en consola
  }
};

