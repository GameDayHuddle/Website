CREATE INDEX `idx_crm_leads_status_created` ON `crm_leads` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_support_tickets_status_priority` ON `support_tickets` (`status`,`priority`);--> statement-breakpoint
PRAGMA optimize;
