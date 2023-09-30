// import Image from "next/image";
import App from "./srpage";

export const metadata = {
  title: "Live Speech To text",
  description: "🎙️  > 📝",
};

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:gap-48 gap-5 lg:flex-row-reverse">
       hello world
       <App />
      </div>
    </div>
  );
}

