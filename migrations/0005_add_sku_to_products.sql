-- Migration number: 0005 	 2026-02-09T17:41:00Z
-- Feature: 003-email-ingestion-api

-- Add SKU column to Products table for reliable mapping with external order data
ALTER TABLE Products ADD COLUMN sku TEXT;

-- Create a unique index on SKU to prevent duplicates and ensure fast lookups
CREATE UNIQUE INDEX idx_products_sku ON Products (sku);
