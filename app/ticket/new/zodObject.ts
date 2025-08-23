import { z } from "zod";


export const InsertTicketSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional(),
  device: z.string().optional(),
  deviceSN: z.string().optional(),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  ticketBalance: z.string().optional(),
  status: z.string().optional(),
  completed: z.boolean().optional(),
});