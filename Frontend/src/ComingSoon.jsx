import { Link } from "react-router-dom";

function ComingSoon() {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>🚧 Coming Soon</h1>
      <p>This feature isn't available yet.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}

export default ComingSoon;