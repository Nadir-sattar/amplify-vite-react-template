import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "./App.css";

const client = generateClient<Schema>();

type Telemetry = {
  deviceName: string;
  timestamp: string;
  motion: boolean;
};

function App() {
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { signOut } = useAuthenticator();

  useEffect(() => {
    let active = true;

    async function fetchTelemetry() {
      try {
        const { data, errors } = await client.queries.getTelemetry({
          deviceName: "motion-01",
        });

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        if (active) {
          setTelemetry(
            (data ?? []).filter(
              (item): item is Telemetry => item !== null
            )
          );

          setLastUpdated(new Date());
          setError("");
        }
      } catch (err) {
        if (active) {
          setError("Failed to fetch telemetry");
          console.error(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchTelemetry();

    const interval = setInterval(fetchTelemetry, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const latest = telemetry[0];
  const detections = telemetry.filter((item) => item.motion);
  const lastMotion = detections[0];

  function formatTime(timestamp: string) {
    return new Date(Number(timestamp) * 1000)
      .toLocaleTimeString("sv-SE", {
        timeZone: "Europe/Stockholm",
      });
  }

  function formatDate(timestamp: string) {
    return new Date(Number(timestamp) * 1000)
      .toLocaleDateString("sv-SE", {
        timeZone: "Europe/Stockholm",
      });
  }

  // Divide the last hour into six 10-minute intervals
  const now = Math.floor(Date.now() / 1000);

  const activity = Array.from({ length: 6 }, (_, i) => {
    const start = now - (6 - i) * 600;
    const end = start + 600;

    return {
      label: formatTime(String(start)).slice(0, 5),
      count: detections.filter((item) => {
        const timestamp = Number(item.timestamp);
        return timestamp >= start && timestamp < end;
      }).length,
    };
  });

  const maxCount = Math.max(
    1,
    ...activity.map((item) => item.count)
  );

  return (
    <main className="telemetry-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">AWS IoT PLATFORM</span>
          <h1>Telemetry Monitor</h1>
          <p>IoT Motion Monitoring System</p>
        </div>

        <button onClick={signOut}>Sign out</button>
      </header>

      <div className="device-header">
        <h2>Device overview</h2>
        <span className="device-tag">motion-01 · ESP32</span>
      </div>

      {loading && <p>Loading telemetry...</p>}
      {error && <p className="error-message">{error}</p>}

      <section className="dashboard">
        <div className="status-card">
          <h3>Latest sensor status</h3>
          <h2 className={
            !latest ? "unknown" :
            latest.motion ? "motion" : "idle"
          }>
            {!latest
              ? "Unknown"
              : latest.motion
              ? "Motion detected"
              : "No motion"}
          </h2>
        </div>

        <div className="status-card">
          <h3>Recent detections</h3>
          <h2 className="metric">{detections.length}</h2>
          <small>Among latest 100 records</small>
        </div>

        <div className="status-card">
          <h3>Last detection</h3>
          <h2 className="metric">
            {lastMotion
              ? formatTime(lastMotion.timestamp)
              : "No data"}
          </h2>
          <small>
            {lastMotion
              ? formatDate(lastMotion.timestamp)
              : ""}
          </small>
        </div>
      </section>

      <section className="panel">
        <h2>Motion activity</h2>
        <p>Last 60 minutes · Latest available records</p>

        <div className="activity-chart">
          {activity.map((item, index) => (
            <div className="chart-column" key={index}>
              <span>{item.count}</span>

              <div className="bar-track">
                <div
                  className="chart-bar"
                  style={{
                    height: `${item.count / maxCount * 100}%`
                  }}
                />
              </div>

              <small>{item.label}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Event history</h2>
        <p>{telemetry.length} records loaded</p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {telemetry.map((item) => (
                <tr key={item.timestamp}>
                  <td>{item.deviceName}</td>
                  <td>{formatDate(item.timestamp)}</td>
                  <td>{formatTime(item.timestamp)}</td>
                  <td>
                    <span className={
                      item.motion
                        ? "event-badge motion"
                        : "event-badge idle"
                    }>
                      {item.motion
                        ? "Motion detected"
                        : "No motion"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        <span>Auto-refresh every 5 seconds</span>
        <span>
          Last updated: {
            lastUpdated
              ? lastUpdated.toLocaleTimeString("sv-SE", {
                  timeZone: "Europe/Stockholm",
                })
              : "—"
          }
        </span>
      </footer>
    </main>
  );
}

export default App;