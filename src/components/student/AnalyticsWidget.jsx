import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const zeroLearningData = [
  { name: "Mon", hours: 0, avg: 0 },
  { name: "Tue", hours: 0, avg: 0 },
  { name: "Wed", hours: 0, avg: 0 },
  { name: "Thu", hours: 0, avg: 0 },
  { name: "Fri", hours: 0, avg: 0 },
  { name: "Sat", hours: 0, avg: 0 },
  { name: "Sun", hours: 0, avg: 0 },
];

const zeroSkillData = [
  { subject: "Cloud (AWS)", A: 0, fullMark: 100 },
  { subject: "DevOps", A: 0, fullMark: 100 },
  { subject: "Cybersecurity", A: 0, fullMark: 100 },
  { subject: "MERN Stack", A: 0, fullMark: 100 },
  { subject: "System Design", A: 0, fullMark: 100 },
  { subject: "DSA", A: 0, fullMark: 100 },
];

export function AnalyticsWidget({
  courses = [],
  progress = {},
  recentActivity = [],
}) {
  const realLearningData = React.useMemo(() => {
    if (!courses || courses.length === 0) return zeroLearningData;

    // Compute actual learning metrics from recentActivity if available, otherwise flat zero
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayMap = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    if (recentActivity && recentActivity.length > 0) {
      recentActivity.forEach((act) => {
        const d = new Date(act.date || Date.now());
        const dayName = days[(d.getDay() + 6) % 7]; // Map 0 (Sun) -> index 6, 1 (Mon) -> index 0
        if (currentDayMap[dayName] !== undefined) {
          currentDayMap[dayName] += 1;
        }
      });
    }

    return days.map((day) => ({
      name: day,
      hours: currentDayMap[day],
      avg: 0,
    }));
  }, [courses, recentActivity]);

  const realSkillData = React.useMemo(() => {
    if (!courses || courses.length === 0) return zeroSkillData;

    const skillMap = {
      "Cloud (AWS)": 0,
      DevOps: 0,
      Cybersecurity: 0,
      "MERN Stack": 0,
      "System Design": 0,
      DSA: 0,
    };

    courses.forEach((c) => {
      const cat = (c.category || "general").toLowerCase();
      const prog =
        progress[c.id] === "completed" ? 100 : parseFloat(progress[c.id] || 0);

      if (cat.includes("cloud") || cat.includes("aws"))
        skillMap["Cloud (AWS)"] += prog;
      else if (cat.includes("devops")) skillMap["DevOps"] += prog;
      else if (cat.includes("cyber")) skillMap["Cybersecurity"] += prog;
      else if (
        cat.includes("dev") ||
        cat.includes("mern") ||
        cat.includes("react")
      )
        skillMap["MERN Stack"] += prog;
      else if (cat.includes("design") || cat.includes("architecture"))
        skillMap["System Design"] += prog;
      else skillMap["DSA"] += prog;
    });

    return Object.keys(skillMap).map((key) => ({
      subject: key,
      A: skillMap[key],
      fullMark: 100,
    }));
  }, [courses, progress]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* Learning Activity Chart */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-dim/20 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-primary">
            Learning Velocity
          </h2>
          <p className="text-sm text-on-surface-variant">
            Hours spent learning this week
          </p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={realLearningData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--secondary)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--secondary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--surface-dim)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="var(--on-surface-variant)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--on-surface-variant)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-container-high)",
                  borderColor: "var(--surface-dim)",
                  borderRadius: "12px",
                }}
                itemStyle={{ color: "var(--on-surface)" }}
              />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="var(--secondary)"
                fillOpacity={1}
                fill="url(#colorAvg)"
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Radar Chart */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-dim/20 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-headline font-bold text-primary">
            Skill Proficiency
          </h2>
          <p className="text-sm text-on-surface-variant">
            Based on quiz scores & completed modules
          </p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={realSkillData}
            >
              <PolarGrid stroke="var(--surface-dim)" />
              <PolarAngleAxis
                dataKey="subject"
                stroke="var(--on-surface)"
                fontSize={11}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Student"
                dataKey="A"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="var(--primary)"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-container-high)",
                  borderColor: "var(--surface-dim)",
                  borderRadius: "12px",
                }}
                itemStyle={{ color: "var(--on-surface)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
