import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Docs } from "@/pages/docs/Docs";
import { Api } from "@/pages/api/Api";
import { Examples } from "@/pages/Examples";
import { Playground } from "@/pages/Playground";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs/*" element={<Docs />} />
        <Route path="/api" element={<Api />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </Layout>
  );
}

export default App;
