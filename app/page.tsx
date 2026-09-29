import Banner from "./banner";
import Quiz from "./quiz";

export default function Page() {
  return (
    <main className="page">
      <header className="brand">
        <span className="brand-name">vinho</span>
      </header>
      <Banner />
      <Quiz />
    </main>
  );
}
