import PatternPage from "./components/PatternPage";
import ProductForm from "./components/ProductForm";

function App() {
  return (
    <PatternPage>
      <section id="builder" aria-label="Builder">
        <ProductForm />
      </section>
    </PatternPage>
  );
}

export default App;
