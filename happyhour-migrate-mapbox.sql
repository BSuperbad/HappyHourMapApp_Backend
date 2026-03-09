-- Migration: add Mapbox coordinate columns to spaces
-- Run this against an existing database that was created before this change.

ALTER TABLE spaces
  ADD COLUMN IF NOT EXISTS latitude FLOAT,
  ADD COLUMN IF NOT EXISTS longitude FLOAT;
