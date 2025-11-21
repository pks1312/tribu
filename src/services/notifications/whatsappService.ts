export interface WhatsAppData {
  phone: string;
  message: string;
}

export const whatsappService = {
  async sendBookingConfirmation(data: {
    phone: string;
    clientName: string;
    serviceName: string;
    professionalName: string;
    date: string;
    time: string;
    bookingId: string;
  }): Promise<void> {
    const phoneNumber = data.phone.replace(/\D/g, '');
    const message = `Hola ${data.clientName}, tu reserva en La Tribu ha sido confirmada:\n\nServicio: ${data.serviceName}\nProfesional: ${data.professionalName}\nFecha: ${data.date}\nHora: ${data.time}\n\nID: ${data.bookingId}\n\nTe esperamos!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('WhatsApp URL:', whatsappUrl);
    
    // TODO: Integrar con API de WhatsApp Business o Twilio
    // Por ahora se genera el enlace que se puede abrir en una nueva ventana
    // O usar window.open(whatsappUrl, '_blank') para abrir WhatsApp Web
  },

  getWhatsAppLink(phone: string, message: string): string {
    const phoneNumber = phone.replace(/\D/g, '');
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }
};

