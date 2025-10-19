# CharityConnect - Setup Guide

## PROG2002 A2 Assessment Project

This guide will help you set up and run the CharityConnect website for the PROG2002 Web Development II assessment.

## Prerequisites

- **Node.js** (version 14 or higher)
- **MySQL** (version 5.7 or higher)
- **npm** (version 6 or higher)
- **Git** (optional, for version control)

## Installation Steps

### 1. Clone or Download the Project

```bash
# If using git
git clone [your-repository-url]
cd web2-a2

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using MySQL Workbench (Recommended)

1. Open MySQL Workbench
2. Create a new connection or use an existing one
3. Execute the SQL file `database/charityevents_db.sql`
4. The script will create the database and populate it with sample data

#### Option B: Using Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database and run schema
CREATE DATABASE charityevents_db;
USE charityevents_db;
SOURCE database/charityevents_db.sql;
EXIT;
```

#### Option C: Using Node.js Script

```bash
# Configure your database settings in .env file first
node database/setup.js
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update the database settings:

```bash
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=charityevents_db
DB_PORT=3306
```

### 5. Start the Server

#### Development Mode (with auto-restart)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

### 6. Access the Website

Open your browser and navigate to:

- **Website**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/health

## Project Structure

```
web2-a2/
├── api/                     # Backend API
│   ├── routes/             # API routes
│   │   ├── events.js       # Event endpoints
│   │   └── categories.js   # Category endpoints
│   ├── node_modules/       # Dependencies
│   ├── index.js            # Server entry point
│   ├── event_db.js         # Database connection
│   └── package.json        # API dependencies
├── client/                  # Frontend
│   ├── css/                # Stylesheets
│   │   ├── main.css        # Base styles
│   │   └── theme.css       # Theme colors
│   ├── js/                 # JavaScript
│   │   ├── main.js         # Core utilities
│   │   ├── home.js         # Home page logic
│   │   ├── search.js       # Search functionality
│   │   └── event-detail.js # Event details logic
│   ├── images/             # Static images
│   ├── index.html          # Home page
│   ├── search.html         # Search page
│   └── event-detail.html   # Event details page
├── database/                # Database
│   ├── charityevents_db.sql # Database schema
│   └── setup.js            # Database initialization
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## Available API Endpoints

### GET /api/health
Health check endpoint

### GET /api/events
Get all events with optional filtering

### GET /api/events/search
Search events with filters:
- `date` - Event date (YYYY-MM-DD)
- `location` - Location name
- `category` - Category ID

Example: `/api/events/search?location=Sydney&category=1`

### GET /api/events/:id
Get detailed information about a specific event

### GET /api/categories
Get all event categories

### GET /api/events/featured/upcoming
Get featured upcoming events for homepage

## Development Tips

### Adding New Features

1. **Database Changes**: Update `database/charityevents_db.sql`
2. **API Endpoints**: Add to `api/routes/`
3. **Frontend Logic**: Add to appropriate JS file in `client/js/`
4. **Styling**: Update `client/css/`

### Debugging

1. **Server Logs**: Check console output for error messages
2. **Browser Console**: Use F12 to open developer tools
3. **Network Tab**: Monitor API requests and responses
4. **Database Queries**: Enable query logging in `api/event_db.js`

## Common Issues and Solutions

### 1. Database Connection Error

**Error**: `ER_ACCESS_DENIED_ERROR` or connection refused

**Solution**: 
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env` file
- Ensure MySQL user has proper permissions

### 2. Port Already in Use

**Error**: `EADDRINUSE :::3000`

**Solution**:
- Change port in `.env` file: `PORT=3001`
- Or kill process using port 3000

### 3. Module Not Found

**Error**: `Cannot find module 'xxx'`

**Solution**:
- Run `npm install` to install all dependencies
- Clear npm cache: `npm cache clean --force`

### 4. CORS Issues

**Error**: Cross-origin requests blocked

**Solution**:
- Ensure you're accessing via http://localhost:3000
- Check CORS configuration in server

## Testing

Run the test suite:

```bash
npm test
```

## Deployment

### Production Environment

1. Set environment variables:
   ```env
   NODE_ENV=production
   PORT=80
   DB_HOST=production-db-host
   DB_USER=production-user
   DB_PASSWORD=secure-password
   ```

2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start api/index.js --name charityconnect
   ```

3. Set up reverse proxy with Nginx:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Support

For technical issues or questions about the implementation:

1. Check this setup guide
2. Review the code comments
3. Check the browser console for error messages
4. Verify database connection and data

## License

This project is created for educational purposes by Qingyang Jiao - 24516659 as part of PROG2002 Web Development II assessment.