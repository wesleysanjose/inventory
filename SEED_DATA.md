# Seed Data Generation

This directory contains scripts to generate comprehensive test data for the IT Assets Inventory Management System.

## Quick Start

### Option 1: Using npm scripts (Recommended)
```bash
# Generate fresh seed data
npm run seed

# Alternative commands
npm run seed:generate
npm run db:reset
```

### Option 2: Direct execution
```bash
# Run the seed script directly
node src/scripts/seed.js

# Or run the TypeScript version directly
npx ts-node src/scripts/generate-seed-data.ts
```

## What Gets Generated

The seed data generator creates a complete test dataset including:

### 📁 **5 Catalogs**
- **Enterprise Servers** (server category)
- **Network Switches** (network-switch category)  
- **Firewalls** (firewall category)
- **Storage Arrays** (storage category)
- **Workstations** (workstation category)

### 🏷️ **8 SKUs** (Product Models)
- **HP ProLiant DL380 Gen10** - Enterprise rack server
- **Dell PowerEdge R740xd** - High-capacity storage server
- **Cisco Catalyst 9300 48-Port** - Enterprise switch
- **Arista 7050X3-32S** - High-performance 100GbE switch
- **Palo Alto PA-3220** - Next-gen firewall
- **Fortinet FortiGate 600F** - Enterprise firewall
- **Dell ME4024** - SAS storage array
- **HP Z4 G4 Workstation** - Development workstation

### 💻 **80 Assets** (10 per SKU)
Each asset includes:
- **Unique asset tags** and serial numbers
- **Geographic distribution** across 5 datacenters:
  - US-East-1 (New York)
  - US-West-2 (San Francisco)
  - EU-Central-1 (Frankfurt)
  - APAC-Southeast-1 (Singapore)
  - US-Central-1 (Chicago)
- **Environment assignments**: production, staging, development, testing, backup
- **Financial data**: purchase prices, dates, depreciation
- **OPEX contracts**: warranty and maintenance agreements
- **Network configuration**: hostnames, IP addresses, rack locations

## Generated Data Features

### 🏢 **Realistic Business Context**
- **Business units**: Engineering, Sales, Marketing, IT, Finance
- **Cost centers**: CC-1000 through CC-9999 series
- **Asset owners**: Named individuals for accountability
- **PO numbers**: Realistic purchase order references

### 💰 **Financial Modeling**
- **Purchase prices**: Realistic market pricing with ±20% variation
- **Depreciation**: 4-year straight-line method
- **OPEX contracts**: Multiple warranty and maintenance agreements per asset
- **Total portfolio value**: Typically $350,000 - $450,000

### 📅 **Time-based Data**
- **Purchase dates**: Random dates over the last 2+ years
- **Go-live dates**: 1-30 days after purchase
- **Contract dates**: Realistic warranty and maintenance timelines
- **Some assets in maintenance/inactive status** for realistic scenarios

## Database Requirements

### MongoDB Connection
The script uses the following connection priority:
1. `MONGODB_URI` environment variable
2. Default: `mongodb://localhost:27017/inventory`

### Environment Variables
```bash
# Optional - customize MongoDB connection
export MONGODB_URI="mongodb://localhost:27017/your_database_name"

# For MongoDB Atlas or remote databases
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/inventory"
```

## Data Volume and Performance

### Generated Volumes
- **5 catalogs** with detailed specifications
- **8 SKUs** with comprehensive product data
- **80 assets** with full lifecycle information
- **120+ OPEX contracts** (warranty & maintenance)
- **Total documents**: ~200+ across all collections

### Performance
- **Generation time**: 5-15 seconds typical
- **Database size**: ~2-5 MB of test data
- **Memory usage**: Minimal - suitable for development environments

## Customization

### Modify Generation Volumes
Edit `src/scripts/generate-seed-data.ts`:
```typescript
const SEED_CONFIG = {
  catalogs: 5,           // Number of catalog categories
  skusPerCatalog: 2,     // SKUs per catalog (varies by template)
  assetsPerSku: 10,      // Assets per SKU
}
```

### Add Custom Data
The script includes arrays you can modify:
- `manufacturers`: Equipment vendors
- `datacenters`: Geographic locations  
- `environments`: Deployment environments
- `catalogTemplates`: Product categories and SKUs

### Business Logic
Customize financial calculations, naming conventions, or contract generation by modifying the respective functions in the script.

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running: `brew services start mongodb/brew/mongodb-community`
- Check connection string in `MONGODB_URI`

**Permission Denied**
```bash
Error: not authorized on inventory to execute command
```
- Verify MongoDB user permissions
- Use a database admin account for initial setup

**ts-node Command Not Found**
```bash
ts-node: command not found
```
- Run: `npm install --save-dev ts-node`
- Or use: `npx ts-node src/scripts/generate-seed-data.ts`

### Validation
After running the seed script, verify data:
```bash
# Check the dashboard at http://localhost:3000
# Should show:
# - 5 catalogs
# - 8 SKUs  
# - 80 assets
# - $350K+ total value
```

## Integration with Application

The generated data is immediately available in the application:
- **Dashboard**: Shows real counts and total value
- **Catalogs page**: Browse the 5 equipment categories
- **SKUs page**: View detailed product specifications
- **Assets page**: Explore individual asset records
- **Reports**: Generate financial forecasts and analysis

All filtering, searching, and reporting features work with the generated data.