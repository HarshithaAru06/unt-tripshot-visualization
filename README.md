# UNT TripShot Night Flight Visualization

**Interactive data visualization dashboard for UNT Transportation Services Night Flight shuttle system**

Built by Harshitha Arugonda | CSCE 5320 - Scientific Data Visualization | Fall 2024

---

## 📊 Project Overview

This project analyzes 8 months of real ride data (16,511 total rides) from the UNT Night Flight shuttle service. I created an interactive web dashboard to help Transportation Services understand demand patterns, optimize routes, and improve service reliability.

As a part-time driver and dispatch worker for Night Flight, I wanted to turn my class project into something practical that could actually help improve the service I work for.

### Key Features

- **Interactive Map** - Visualize pickup/dropoff locations and top routes with Google Maps integration
- **Analytics Dashboard** - Monthly trends, booking methods, ride pooling analysis, and key performance metrics
- **Deep Insights** - Advanced visualizations showing patterns across time, location, and rider behavior
- **Detailed Analysis** - 30+ comprehensive charts covering every aspect of the service
- **Schedule Comparison** - Side-by-side analysis of Spring (7PM-2AM) vs Fall (9PM-2AM) semesters

---

## 🚀 Live Demo

[View Live Dashboard](https://unttripv.manus.space) *(if published)*

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts (React charting library)
- **Maps**: Google Maps JavaScript API (via Manus proxy)
- **Build Tool**: Vite
- **Package Manager**: pnpm

---

## 📁 Project Structure

```
unt-tripshot-viz/
├── client/
│   ├── public/
│   │   ├── tripshot_data.json          # Processed ride data
│   │   ├── tripshot_routes.json        # Top routes data
│   │   └── tripshot_locations.json     # Pickup/dropoff locations
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.tsx                 # Google Maps integration
│   │   │   ├── StatsPanel.tsx          # Statistics cards
│   │   │   └── ui/                     # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Home.tsx                # Main dashboard with map
│   │   │   ├── Analytics.tsx           # Analytics dashboard
│   │   │   ├── DeepInsights.tsx        # Advanced visualizations
│   │   │   ├── DetailedAnalysis.tsx    # Comprehensive analysis
│   │   │   └── ScheduleComparison.tsx  # Spring vs Fall comparison
│   │   ├── App.tsx                     # Main app with routing
│   │   └── main.tsx                    # React entry point
│   └── index.html
├── package.json
└── README.md
```

---

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/unt-tripshot-viz.git
cd unt-tripshot-viz

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The development server will start at `http://localhost:3000`

---

## 📊 Data Processing

The raw CSV data (`night_flight_all_months.csv`) contains 16,511 rides across 8 months. I cleaned and processed the data to:

1. **Filter service hours** - Only Night Flight hours (19:00-02:00)
2. **Calculate metrics** - Wait times, trip durations, completion rates
3. **Combine locations** - Merged duplicate stop names (e.g., "Eagle Landing" variations)
4. **Group data** - By month, day, hour, location, driver, booking method
5. **Export JSON** - Generated optimized JSON files for fast web loading

### Data Files

- `tripshot_data.json` - All processed ride data with calculated fields
- `tripshot_routes.json` - Top 20 routes with coordinates
- `tripshot_locations.json` - All pickup/dropoff locations with coordinates

---

## 🌐 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build the project
pnpm build

# Deploy the client/dist folder to Netlify
```

### Deploy to GitHub Pages

```bash
# Build with base path
pnpm build --base=/unt-tripshot-viz/

# Deploy client/dist to gh-pages branch
```

---

## 📈 Key Findings

From analyzing 10,878 completed rides:

- **Peak demand**: Wednesday 10-11 PM (373 rides)
- **Busiest route**: Lot 20 Resident → Maple Hall (1,247 rides)
- **Average wait time**: 2.8 minutes
- **Ride pooling rate**: 29.61% (efficiency opportunity)
- **Cancellation rate**: 26.7% average (varies by month)
- **Spring vs Fall**: 2,300+ rides lost after schedule change (7PM→9PM start)

---

## 🎓 Academic Context

This project was completed for **CSCE 5320 - Scientific Data Visualization** at the University of North Texas. The goal was to apply visualization principles to real-world data and create actionable insights.

**Learning Outcomes:**
- Data cleaning and preprocessing for visualization
- Interactive dashboard design principles
- Choosing appropriate chart types for different data patterns
- Balancing aesthetics with functionality
- Creating visualizations for non-technical audiences

---

## 📝 License

MIT License - feel free to use this code for your own projects!

---

## 👤 Author

**Harshitha Arugonda**
- UNT ID: 11814029
- Course: CSCE 5320 - Scientific Data Visualization
- Role: Part-time Night Flight Driver & Dispatch Worker

---

## 🙏 Acknowledgments

- UNT Transportation Services for providing the data
- Professor [Name] for guidance on visualization best practices
- My fellow Night Flight drivers for insights on service patterns
- The React and Recharts communities for excellent documentation

---

## 🐛 Known Issues

- Map requires internet connection (Google Maps API)
- Large datasets may cause slight lag on older devices
- Mobile responsiveness could be improved for detailed charts

---

## 🔮 Future Improvements

- [ ] Add real-time data integration
- [ ] Export charts as PNG/PDF
- [ ] Mobile-optimized layouts
- [ ] Driver performance analytics (with privacy protection)
- [ ] Predictive demand modeling
- [ ] Route optimization suggestions

---

**Built with ❤️ for UNT Transportation Services**
