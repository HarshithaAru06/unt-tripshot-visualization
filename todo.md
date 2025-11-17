# UNT TripShot Visualization - Project TODO

## Core Features
- [x] Setup Three.js 3D visualization environment
- [x] Import and process shuttle data JSON
- [x] Create 3D campus map with location markers
- [x] Build monthly data selector/navigator
- [x] Implement interactive route visualization
- [x] Add animated ride flow effects
- [x] Display real-time statistics dashboard
- [x] Create hourly distribution charts
- [x] Add top routes visualization
- [x] Implement summer break indicator (May 13 - Aug 9)
- [x] Design responsive layout with UNT branding
- [x] Add smooth transitions between months
- [x] Create interactive location tooltips
- [x] Implement camera controls for 3D view
- [x] Add loading states and animations
- [x] Optimize performance for large datasets
- [x] Test cross-browser compatibility
- [x] Final polish and UX refinements

## New Advanced Features
- [x] Integrate satellite imagery of UNT campus
- [x] Add real 3D terrain and geography
- [x] Implement proper map-based location coordinates
- [x] Remove all Manus branding from footer and UI
- [x] Deploy website for public access
- [x] Generate and test live access link

## Bug Fixes
- [x] Fix Mapbox tile loading errors by switching to Google Maps with built-in proxy
- [x] Implement proper 3D satellite view with Google Maps API
- [x] Convert normalized coordinates (0-1100) to actual GPS lat/lng for UNT campus

## HTML Validation Fixes
- [x] Fix invalid HTML nesting: <p> cannot contain <div> or nested <p>

## Service Hours and Analytics Features
- [x] Fix hourly distribution chart to start at 7 PM (19:00) and end at 2 AM (02:00)
- [x] Reorder hourly data to show proper service flow (7 PM → 2 AM)
- [x] Create new Analytics page route
- [x] Analyze call vs TripShot app usage data
- [x] Show booking method transitions (call to app adoption)
- [x] Display comprehensive metrics and insights
- [x] Add navigation between main visualization and analytics pages

## Advanced Analytics and Design Improvements
- [x] Fix call detection logic (6-10 digits in rider name = phone call)
- [x] Re-analyze all data with correct call/app classification
- [x] Add advanced statistical analysis and insights
- [x] Add predictive patterns and correlations
- [x] Add shuttle background images to both pages
- [x] Add author credit: Harshitha Arugonda - Comprehensive Data Analysis
- [x] Make design more graphic and professional (less AI-generated)
- [x] Enhance visual design with better graphics

## Hourly Chart Fixes and Enhanced Visualizations
- [x] Fix hourly chart for Jan-May: show only 7 PM (19:00) to 2 AM (02:00)
- [x] Fix hourly chart for Aug-Oct: show only 10 PM (22:00) to 2 AM (02:00) - exclude 7-9 PM
- [x] Add area charts for trend visualization
- [x] Add radar charts for comparative analysis
- [ ] Add scatter plots for correlation insights
- [ ] Add stacked bar charts for composition analysis
- [ ] Add line trend charts with projections
- [x] Enhance UI with smoother animations
- [x] Make interactions more natural and intuitive
- [x] Improve spacing and visual hierarchy

## Data Preprocessing and Map Improvements
- [x] Properly clean and preprocess CSV data (remove irrelevant columns, handle missing values)
- [x] Add January data disclaimer (incomplete records due to post-reopening data collection issues)
- [x] Note that January doesn't have call/app booking data due to data collection problems
- [x] Switch from satellite view to regular map view
- [x] Fix green location markers to show for all months including January
- [x] Add animated shuttle icon that moves between location dots
- [x] Make shuttle animation dynamic based on route data
- [x] Fix August-October hourly chart to show 21:00 (9 PM) to 2 AM, not 22:00
- [x] Add day-of-week ride distribution analysis (Monday-Sunday breakdown)

## Bug Fixes
- [x] Fix Google Maps API being loaded multiple times warning

## Interactive Tableau-Style Visualizations
- [x] Analyze data to extract hourly breakdown by day of week for each month
- [x] Add diverse graph types (bar, line, pie, scatter, stacked area)
- [x] Make day-of-week bars clickable to filter and show hourly breakdown
- [x] Create Tableau-style dashboard layout with multiple interactive charts
- [x] Add visual feedback when clicking on day-of-week bars
- [x] Display hourly distribution for selected day below the day-of-week chart

## Privacy Protection
- [x] Remove all rider names from data processing and visualization
- [x] Remove all driver names from data processing and visualization
- [x] Add privacy notice explaining personal information has been redacted
- [x] Update data processing scripts to exclude name columns
- [x] Add disclaimer about privacy protection as reason for data anonymization

## Deep Insights Page - Tableau-Style Visualizations
- [x] Create new Deep Insights page route
- [x] Prepare heatmap data (day of week × hour matrix)
- [x] Add line charts for trend analysis over time
- [x] Add vertical bar charts for comparisons
- [x] Add horizontal bar charts for rankings
- [x] Add grouped bar charts for multi-dimensional comparisons
- [x] Add heatmap visualization for time-based patterns
- [ ] Add scatter plots for correlation analysis (wait time vs duration, etc.)
- [x] Add stacked bar charts for composition analysis
- [x] Add navigation links to Deep Insights page from other pages

## Bug Fixes - Deep Insights Data
- [x] Fix deep_insights_data.json generation - currently all values are 0
- [x] Regenerate heatmap data with actual ride counts by day and hour
- [x] Fix monthly_trends to include correct completed/cancelled counts
- [x] Fix grouped_bar and stacked_bar data
- [x] Verify all Deep Insights visualizations display data correctly

## Bug Fixes - Deep Insights
- [x] Fix empty vertical bar graph (Day of Week Comparison)

## Detailed Analysis Page - 30+ Charts
- [x] Create fourth "Detailed Analysis" page route
- [x] Section 1: Big Overview (Rides per month, per active day, avg wait time)
- [x] Section 2: Time-of-Night Patterns (Rides per hour, wait per hour, heatmap, weekday vs weekend)
- [x] Section 3: Schedule Change Story (Before May 13 vs After Aug 9 comparison)
- [x] Section 4: Stops/Locations (Top pickup/dropoff, wait times by stop, origin-destination matrix)
- [x] Section 5: Rider Experience (Wait time histogram, cumulative %, ride duration, scatter plot)
- [x] Section 6: Operations & Pooling (Pooled rides distribution, wait vs pooling, rides per driver/vehicle)
- [x] Section 7: Cancellations (Cancel rate by month/hour/stop)
- [x] Section 8: Booking Method Analysis (TripShot vs Dispatch Call breakdown)
- [x] Add navigation links to Detailed Analysis page

## Time Format Improvements
- [x] Convert all hour labels from 24-hour format (13, 14, 15) to 12-hour AM/PM format (1 PM, 2 PM, 3 PM)
- [x] Update data generation script to include formatted time labels
- [x] Update all time-based charts on Detailed Analysis page to display AM/PM format
- [x] Ensure consistency across all hourly visualizations
