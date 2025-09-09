import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAIL_SERVICE_ID;
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAIL_TEMPLATE_ID;
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAIL_PUBLIC_KEY;



// Initialize EmailJS (moved to sendEmail for dynamic config)
// emailjs.init(EMAIL_PUBLIC_KEY);

export interface EmailData {
  [key: string]: unknown;  // ✅ This line fixes the TS2345 error
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
  request_id?: string;
  item_type?: string;
  quantity?: string;
  status?: string;
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    let serviceId = EMAIL_SERVICE_ID;
    let templateId = EMAIL_TEMPLATE_ID;
    let publicKey = EMAIL_PUBLIC_KEY;

    const storedConfig = localStorage.getItem('emailjs_config');
    if (storedConfig) {
      const localConfig = JSON.parse(storedConfig);
      serviceId = localConfig.serviceId || serviceId;
      templateId = localConfig.templateId || templateId;
      publicKey = localConfig.publicKey || publicKey;
    }

    if (!serviceId || !templateId || !publicKey) {
      toast.error('Email service is incomplete. Please check your configuration in settings or .env file.');
      console.error('Missing EmailJS configuration: serviceId, templateId, or publicKey.');
      return false;
    }

    emailjs.init(publicKey); // Initialize with dynamic public key

    const result = await emailjs.send(
      serviceId,
      templateId,
      emailData
    );
    
    if (result.status === 200) {
      console.log('Email sent successfully:', result);
      return true;
    }
    console.error('Email failed to send with status:', result.status, result.text);
    return false;
  } catch (error) {
    console.error('Failed to send email:', error);
    toast.error('Failed to send email. Please check your settings and network connection.');
    return false;
  }
};

// Email templates for different notification types
export const emailTemplates = {
  newRequest: (employeename: string, itemtype: string, quantity: number, purpose: string) => ({
    subject: `New Inventory Request from ${employeename}`,
    message: `
      A new inventory request has been submitted:
      
      Employee: ${employeename}
      Item Type: ${itemtype}
      Quantity: ${quantity}
      Purpose: ${purpose}
      
      Please review and approve/reject this request in the inventory management system.
    `
  }),

  requestApproved: (employeename: string, itemtype: string, quantity: number, remarks?: string) => ({
    subject: `Your Inventory Request has been Approved`,
    message: `
      Good news! Your inventory request has been approved:
      Employee: ${employeename}
      Item Type: ${itemtype}
      Quantity: ${quantity}
      ${remarks ? `Remarks: ${remarks}` : ''}
      
      Please coordinate with the stock manager for item collection.
    `
  }),

  requestRejected: (employeename: string, itemtype: string, quantity: number, remarks?: string) => ({
    subject: `Your Inventory Request has been Rejected`,
    message: `
      Your inventory request has been rejected:
      Employee: ${employeename}
      Item Type: ${itemtype}
      Quantity: ${quantity}
      ${remarks ? `Reason: ${remarks}` : ''}
      
      Please contact your manager if you have any questions.
    `
  }),

  lowStock: (itemName: string, currentStock: number, minimumLevel: number) => ({
    subject: `Low Stock Alert: ${itemName}`,
    message: `
      ALERT: Low stock detected for ${itemName}
      
      Current Stock: ${currentStock}
      Minimum Level: ${minimumLevel}
      
      Please reorder this item to maintain adequate inventory levels.
    `
  })
};

// Send notification emails based on action type
export const sendNotificationEmail = async (
  type: 'newRequest' | 'requestApproved' | 'requestRejected' | 'lowStock',
  recipientEmail: string,
  recipientName: string,
  data: any
): Promise<boolean> => {
  let template;
  
  switch (type) {
    case 'newRequest':
      template = emailTemplates.newRequest(data.employeename, data.itemtype, data.quantity, data.purpose);
      break;
    case 'requestApproved':
      template = emailTemplates.requestApproved(data.employeename, data.itemtype, data.quantity, data.remarks);
      break;
    case 'requestRejected':
      template = emailTemplates.requestRejected(data.employeename, data.itemtype, data.quantity, data.remarks);
      break;
    case 'lowStock':
      template = emailTemplates.lowStock(data.itemName, data.currentStock, data.minimumLevel);
      break;
    default:
      return false;
  }

  const emailData: EmailData = {
    to_email: recipientEmail,
    to_name: recipientName,
    from_name: 'Inventory Management System',
    subject: template.subject,
    message: template.message,
    ...data
  };

  return await sendEmail(emailData);
};