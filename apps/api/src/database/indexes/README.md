# Database Indexes

Index definitions are co-located with their Mongoose models.
This folder is reserved for shared index utilities and documentation.

## Convention

Each model file (`src/models/*.model.ts`) calls `schema.index()` directly.
Complex compound indexes that span multiple collections are documented here.
