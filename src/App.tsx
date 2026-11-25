import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

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

  const motionEvents = telemetry.filter(
    (item) => item.motion
  ).length;

  const lastMotion = telemetry.find(
    (item) => item.motion
  );

  function formatTime(timestamp: string) {
    return new Date(Number(timestamp) * 1000)
      .toLocaleString("sv-SE", {
        timeZone: "Europe/Stockholm",
      });
  }

  return (
    <main>
      <h1>Telemetry Monitor</h1>
      <p>AWS IoT Motion Monitoring System</p>

      <button onClick={signOut}>Sign out</button>

      <hr />

      <h2>Device: motion-01</h2>

      {loading && <p>Loading telemetry...</p>}
      {error && <p>{error}</p>}

      <section className="dashboard">
        <div className="status-card">
          <h3>Motion status</h3>
          <h2 style={{
            color: latest?.motion ? "#ef4444" : "#22c55e"
          }}>
            {!latest
              ? "Unknown"
              : latest.motion
              ? "Motion detected"
              : "No motion"}
          </h2>
        </div>

        <div className="status-card">
          <h3>Recent motion events</h3>
          <h2>{motionEvents}</h2>
        </div>

        <div className="status-card">
          <h3>Last detection</h3>
          <h2>
            {lastMotion
              ? formatTime(lastMotion.timestamp)
              : "No data"}
          </h2>
        </div>
      </section>

      <h2>Recent activity</h2>

      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Timestamp</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {telemetry.map((item) => (
            <tr key={item.timestamp}>
              <td>{item.deviceName}</td>
              <td>{formatTime(item.timestamp)}</td>
              <td style={{
                color: item.motion ? "#ef4444" : "#22c55e"
              }}>
                {item.motion
                  ? "Motion detected"
                  : "No motion"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Automatically refreshing every 5 seconds</p>
    </main>
  );
}

export default App;