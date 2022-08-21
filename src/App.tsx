import { Editor } from "./components/Editor";
import "./index.css";

function App() {
  return (
    <div className="container mx-auto py-6 ">
      <h1 className="font-bold text-3xl">draftjs-experiment</h1>
      <div className="max-w-2xl">
        <div className="border py-4 px-2 border-neutral-500/50 rounded mt-5">
          <Editor />
        </div>
      </div>
    </div>
  );
}

export default App;
