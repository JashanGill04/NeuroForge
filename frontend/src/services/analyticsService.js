// ---------------------------------------------------------------------------
// AnalyticsService — derives chart-ready data from the Milestone 2 mock store
// ---------------------------------------------------------------------------
// Velocity is computed for real from the mock tasks generated per sprint
// (sum of story points on DONE tasks). Burndown needs day-by-day progress,
// which the mock layer can't know (no timestamps on task completion yet), so
// the daily curve is a smoothed simulation anchored to today's real totals —
// clearly cosmetic, and swappable once the backend tracks status-change
// timestamps (Kafka event log would be the natural source for this later).
// ---------------------------------------------------------------------------
import client from '../api/client'

export const analyticsService = {
  
  async getVelocity(sprints) {
    const results = [];
    for (const sprint of sprints) {
      try {
        const data = await client.get(`/sprint-progress/${sprint.id}`).then((r) => r.data);
        results.push({ 
          sprint: sprint.goal || `Sprint ${sprint.id}`, 
          committed: data.totalPoints || 0, 
          completed: data.completedPoints || 0 
        });
      } catch (error) {
        console.error(`Failed to fetch velocity for sprint ${sprint.id}`, error);
      }
    }
    return results;
  },

 async getBurndown(sprint) {
    // 1. Fetch real totals and historical map from the backend
    const data = await client.get(`/sprint-progress/${sprint.id}`).then((r) => r.data);
    
    // Debugging: Check your browser console to see exactly what the backend sent!
    console.log("Sprint Progress Data from Backend:", data);
    
    const totalPoints = data.totalPoints || 0;
    const burndownMap = data.burndownData || {};
    
    // STRICT DATE PARSER: Ignores timezones and forces local midnight
    const parseDateString = (dateStr) => {
      if (!dateStr) return new Date();
      const [y, m, d] = dateStr.split('-');
      return new Date(y, m - 1, d); 
    };

    // STRICT DATE FORMATTER: Guarantees "YYYY-MM-DD" local time
    const toYYYYMMDD = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const startDate = parseDateString(sprint.startDate);
    const endDate = parseDateString(sprint.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    const series = [];
    let currentRemaining = totalPoints;

    for (let d = 0; d <= totalDays; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + d);
      currentDate.setHours(0, 0, 0, 0);
      
      // Now this is guaranteed to match the backend's String exactly
      const dateString = toYYYYMMDD(currentDate);
      const displayDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const idealPoints = Math.max(0, Math.round(totalPoints - (totalPoints / totalDays) * d));
      let actualPoints = null;

      // Only plot up to today
      if (currentDate <= today) {
        if (burndownMap[dateString] !== undefined) {
          currentRemaining = burndownMap[dateString];
        }
        actualPoints = currentRemaining;
      }

      series.push({
        day: displayDate, 
        ideal: idealPoints,
        actual: actualPoints
      });
    }

    return { series, totalPoints, remainingNow: currentRemaining };
  }
};