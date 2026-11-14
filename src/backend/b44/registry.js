import asaasWebhook from './functions/asaasWebhook.js';
import cancelRegistration from './functions/cancelRegistration.js';
import checkPixStatus from './functions/checkPixStatus.js';
import checkinTicket from './functions/checkinTicket.js';
import cleanupInvites from './functions/cleanupInvites.js';
import createStoreOrder from './functions/createStoreOrder.js';
import createTicketOrder from './functions/createTicketOrder.js';
import encryptStoredCpfs from './functions/encryptStoredCpfs.js';
import evaluateBatches from './functions/evaluateBatches.js';
import expireTickets from './functions/expireTickets.js';
import gateStats from './functions/gateStats.js';
import issueTickets from './functions/issueTickets.js';
import issuedTickets from './functions/issuedTickets.js';
import staffAccess from './functions/staffAccess.js';
import staffData from './functions/staffData.js';
import storeOrderActions from './functions/storeOrderActions.js';
import ticketOrderActions from './functions/ticketOrderActions.js';
import ticketQr from './functions/ticketQr.js';

export const FUNCTIONS = {
  asaasWebhook, cancelRegistration, checkPixStatus, checkinTicket, cleanupInvites, createStoreOrder,
  createTicketOrder, encryptStoredCpfs, evaluateBatches, expireTickets, gateStats, issueTickets, issuedTickets, staffAccess,
  staffData, storeOrderActions, ticketOrderActions, ticketQr,
};
