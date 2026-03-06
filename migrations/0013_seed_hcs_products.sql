-- Migration: Seed Hockey Camp Sweden Products
-- These correspond to the standard SKUs used in the Swedish shop exports

INSERT OR IGNORE INTO Products (name, sku, base_price, description, status)
VALUES ('Adult Mixed', 'HCS-ADULT', 125, 'Dates: 22nd August. Recommended 1 year playing experience.', 'active');

INSERT OR IGNORE INTO Products (name, sku, base_price, description, status)
VALUES ('Advanced Elite (2008-2011)', 'HCS-ADV-ELITE', 295, 'Dates: 23rd–25th August', 'active');

INSERT OR IGNORE INTO Products (name, sku, base_price, description, status)
VALUES ('Advanced Pro (2011-2015)', 'HCS-ADV-PRO', 295, 'Dates: 23rd–25th August', 'active');

INSERT OR IGNORE INTO Products (name, sku, base_price, description, status)
VALUES ('Kempe Group (2014-2019)', 'HCS-KEMPE', 295, 'Dates: 26th–28th August', 'active');

INSERT OR IGNORE INTO Products (name, sku, base_price, description, status)
VALUES ('Nylander Group (2011-2017)', 'HCS-NYLANDER', 295, 'Dates: 26th–28th August', 'active');
