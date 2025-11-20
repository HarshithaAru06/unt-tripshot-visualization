import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DeepInsights from "./pages/DeepInsights";
import Analytics from "./pages/Analytics";
import DetailedAnalysis from "./pages/DetailedAnalysis";
import ScheduleComparison from "./pages/ScheduleComparison";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/insights"} component={DeepInsights} />
      <Route path={"/detailed"} component={DetailedAnalysis} />
      <Route path={"/schedule-comparison"} component={ScheduleComparison} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
