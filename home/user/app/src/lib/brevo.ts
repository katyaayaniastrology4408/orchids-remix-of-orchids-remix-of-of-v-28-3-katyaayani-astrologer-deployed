import * as Brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new (Brevo as any).TransactionalEmailsApi();
const apiKey = (apiInstance as any).authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

const contactsApiInstance = new (Brevo as any).ContactsApi();
const contactsApiKey = (contactsApiInstance as any).authentications['apiKey'];
contactsApiKey.apiKey = process.env.BREVO_API_KEY || '';

// Send transactional email
export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
  textContent,
  senderName = 'Katyaayani Astrologer',
  senderEmail = 'katyaayaniastrologer01@gmail.com',
}: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderName?: string;
  senderEmail?: string;
}) {
  const sendSmtpEmail = new (Brevo as any).SendSmtpEmail();
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { name: senderName, email: senderEmail };
  sendSmtpEmail.to = to;
  
  if (textContent) {
    sendSmtpEmail.textContent = textContent;
  }

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    throw error;
  }
}

// Add contact to Brevo list
export async function addContactToList({
  email,
  firstName,
  lastName,
  listIds = [2], // Default list ID
  attributes = {},
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  listIds?: number[];
  attributes?: Record<string, string | number | boolean>;
}) {
  const createContact = new (Brevo as any).CreateContact();
  
  createContact.email = email;
  createContact.listIds = listIds;
  createContact.attributes = {
    ...attributes,
    ...(firstName && { FIRSTNAME: firstName }),
    ...(lastName && { LASTNAME: lastName }),
  };

  try {
    await contactsApiInstance.createContact(createContact);
    return { success: true };
  } catch (error: any) {
    // If contact already exists, update it
    if (error?.response?.status === 400 && error?.response?.body?.code === 'duplicate_parameter') {
        const updateContact = new (Brevo as any).UpdateContact();
      updateContact.listIds = listIds;
      updateContact.attributes = createContact.attributes;
      
      await contactsApiInstance.updateContact(email, updateContact);
      return { success: true, updated: true };
    }
    console.error('Error adding contact to Brevo:', error);
    throw error;
  }
}

// Send newsletter campaign
export async function sendNewsletterCampaign({
  name,
  subject,
  htmlContent,
  listIds,
  senderName = 'Katyaayani Astrologer',
  senderEmail = 'katyaayaniastrologer01@gmail.com',
  scheduledAt,
}: {
  name: string;
  subject: string;
  htmlContent: string;
  listIds: number[];
  senderName?: string;
  senderEmail?: string;
  scheduledAt?: Date;
}) {
  const campaignApiInstance = new (Brevo as any).EmailCampaignsApi();
  const campaignApiKey = (campaignApiInstance as any).authentications['apiKey'];
  campaignApiKey.apiKey = process.env.BREVO_API_KEY || '';

  const emailCampaign = new (Brevo as any).CreateEmailCampaign();
  emailCampaign.name = name;
  emailCampaign.subject = subject;
  emailCampaign.sender = { name: senderName, email: senderEmail };
  emailCampaign.htmlContent = htmlContent;
  emailCampaign.recipients = { listIds };

  if (scheduledAt) {
    emailCampaign.scheduledAt = scheduledAt.toISOString();
  }

  try {
    const data = await campaignApiInstance.createEmailCampaign(emailCampaign);
    return { success: true, campaignId: data.id };
  } catch (error) {
    console.error('Error creating email campaign via Brevo:', error);
    throw error;
  }
}
